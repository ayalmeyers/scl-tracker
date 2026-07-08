// Wrap everything in a bootstrapper to prevent CDN script-loading race conditions
function bootstrapSCLAddIn() {
  try {
    const { useState, useEffect, useCallback, useMemo } = React;

    // GLOBAL CONFIGS & CONSTANTS
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
    const STATUSES = ['Paid','Part Paid','Invoiced','SOW/Pending','On Hold','Other'];
    const INK='#1F3864', LINE='#E4E7EE', GO='#15803D', WARN='#B45309', DANGER='#B91C1C', BG='#F6F7F9';

    // Live Roster cache
    let ROSTER = [];

    const MSAL_CONFIG = {
      auth: {
        clientId: 'eb6e6717-7f19-4491-b78a-7aa4f72d81f0',
        authority: 'https://login.microsoftonline.com/6beb0f9d-db3e-45fc-bcc4-b09729c0b74e',
        redirectUri: 'https://scl-tracker.vercel.app/index.html'
      }
    };

    const getMSAL = () => {
      return new Promise((resolve, reject) => {
        if (window.msal) { 
          resolve(new window.msal.PublicClientApplication(MSAL_CONFIG)); 
          return; 
        }
        const s = document.createElement('script');
        s.src = 'https://alcdn.msauth.net/browser/2.38.3/js/msal-browser.min.js';
        s.onload = () => resolve(new window.msal.PublicClientApplication(MSAL_CONFIG));
        s.onerror = () => reject(new Error('Microsoft Auth CDN script blocked by Outlook security policy. Ensure it is explicitly defined in your index.html file.'));
        document.head.appendChild(s);
      });
    };

    const getGraphToken = async () => {
      const pca = await getMSAL();
      await pca.initialize();
      const accounts = pca.getAllAccounts();
      const request = { scopes: ['Files.ReadWrite.All', 'User.Read', 'Sites.Read.All'] };
      if (accounts.length > 0) {
        try {
          const result = await pca.acquireTokenSilent({ ...request, account: accounts[0] });
          return result.accessToken;
        } catch(_) {}
      }
      const result = await pca.acquireTokenPopup(request);
      return result.accessToken;
    };

    const fetchRosterFromSharePoint = async () => {
      const token = await getGraphToken();
      
      const searchRes = await fetch(
        "https://graph.microsoft.com/v1.0/search/query",
        {
          method: 'POST',
          headers: { 
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [{
              entityTypes: ['driveItem'],
              query: { queryString: '"AUTOMATION TEST - 260202 Rev Sheet"' },
              size: 5
            }]
          })
        }
      );
      
      const searchData = await searchRes.json();
      const hits = searchData.value?.[0]?.hitsContainers?.[0]?.hits || [];
      const fileHit = hits.find(h => h.resource?.name && h.resource.name.includes('260202'));
      
      if (!fileHit) {
        throw new Error("Could not find the Excel tracker anywhere on SharePoint or Teams. Verify the file name exactly matches 'AUTOMATION TEST - 260202 Rev Sheet'.");
      }

      const fileId = fileHit.resource.id;
      const driveId = fileHit.resource.parentReference?.driveId;
      
      if (!driveId) {
        throw new Error("Target file located, but parent library path details could not be extracted.");
      }

      const hdrsRes = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/workbook/tables/tblRevenue/columns`,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      const hdrsData = await hdrsRes.json();
      if (hdrsData.error) throw new Error(`SharePoint Header Error: ${hdrsData.error.message}`);
      
      const colMap = {};
      const rawHeaders = [];
      (hdrsData.value || []).forEach(c => { 
        rawHeaders.push(c.name);
        colMap[c.name] = c.index;
        const normalizedKey = c.name.toLowerCase().replace(/[\s_\-]/g, '');
        colMap[normalizedKey] = c.index;
      });

      const idxId = colMap['EngagementID'] !== undefined ? colMap['EngagementID'] : colMap['engagementid'];
      const idxClient = colMap['Client'] !== undefined ? colMap['Client'] : colMap['client'];
      const idxEng = colMap['Engagement'] !== undefined ? colMap['Engagement'] : colMap['engagement'];
      const idxOwner = colMap['Owner'] !== undefined ? colMap['Owner'] : colMap['owner'];
      const idxStatus = colMap['Status'] !== undefined ? colMap['Status'] : colMap['status'];

      if (idxId === undefined || idxClient === undefined || idxEng === undefined) {
        throw new Error(`Critical table headers missing. Detected columns: [${rawHeaders.join(', ')}]. Ensure you have columns named 'EngagementID', 'Client', and 'Engagement'.`);
      }

      const rowsRes = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/workbook/tables/tblRevenue/rows`,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      const rowsData = await rowsRes.json();
      if (rowsData.error) throw new Error('Could not read tblRevenue: ' + rowsData.error.message);

      const rawRowsArray = rowsData.value || [];

      const roster = rawRowsArray.map(row => {
        const v = row.values[0];
        const monthData = {};
        
        MONTHS.forEach(m => {
          const mIdx = colMap[m] !== undefined ? colMap[m] : colMap[m.toLowerCase()];
          const val = mIdx !== undefined ? v[mIdx] : null;
          if (val !== null && val !== '' && val !== 0) monthData[m] = Number(val);
        });
        
        return {
          id: String(v[idxId] || '').trim(),
          client: String(v[idxClient] || '').trim(),
          engagement: String(v[idxEng] || '').trim(),
          owner: idxOwner !== undefined ? String(v[idxOwner] || '').trim() : '',
          status: idxStatus !== undefined ? String(v[idxStatus] || '').trim() : '',
          months: monthData,
        };
      }).filter(r => r.id && r.id !== '' && r.id !== 'undefined' && r.id !== 'null');

      // 🌟 DIAGNOSTIC UPGRADE: Show exactly what cell contents are inside your first row
      if (roster.length === 0) {
        const totalRowsFound = rawRowsArray.length;
        const firstRowValues = totalRowsFound > 0 ? JSON.stringify(rawRowsArray[0].values[0]) : "COMPLETELY EMPTY TABLE";
        throw new Error(`Connected! Read ${totalRowsFound} table rows, but all IDs were blank or invalid. Target ID column: '${rawHeaders[idxId]}' (Index ${idxId}). First row data cells look like: ${firstRowValues}. Please add data down your columns in Excel.`);
      }

      return roster;
    };

    const money = n => n==null||n==='' ? '—' : '$'+Number(n).toLocaleString();
    const persist = (k,v) => {try{localStorage.setItem(k,JSON.stringify(v));}catch(_){}};
    const recall = (k,fb) => {try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch(_){return fb;}};

    const callClaude = async (emailText, apiKey) => {
      const rosterBlock = ROSTER.map(r =>
        r.id+'|'+r.client+'|'+r.engagement+'|'+r.owner+'|'+(r.status||'(blank)')
      ).join('\n');
      const sys = 'You read one email and propose a single update to a revenue tracker. Match the email to exactly one engagement from the roster. Client names may differ slightly. Engagements are often a person name. Match on meaning.\n\nReturn ONE json object, no markdown:\n{"relevant":boolean,"matched_id":string|null,"match_confidence":"high"|"medium"|"low","status_change":{"to":string}|null,"amount_change":{"month":string,"amount":number}|null,"reasoning":string,"email_excerpt":string}\n\n"high" only when one row is a clear fit. Never invent an ID. Ambiguous = null + low.';
      const user = 'ROSTER:\n'+rosterBlock+'\n\nEMAIL:\n"""\n'+emailText+'\n"""';
      
      const res = await fetch('https://scl-tracker.vercel.app/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 800, system: sys, messages: [{ role: 'user', content: user }] })
      });

      if (!res.ok) {
        const rawText = await res.text();
        throw new Error(`Vercel Server Error (${res.status}): ${rawText.substring(0, 120)}...`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      let txt = (data.content||[]).filter(b => b.type==='text').map(b => b.text).join('');
      txt = txt.replace(/```json|```/g,'').trim();
      const s = txt.indexOf('{'), e = txt.lastIndexOf('}');
      return JSON.parse(txt.slice(s, e+1));
    };

    window.callClaude = callClaude;

    const getEmailText = () => {
      return new Promise((resolve, reject) => {
        const item = Office.context.mailbox.item;
        if (!item) { reject(new Error('No email selected')); return; }
        item.body.getAsync(Office.CoercionType.Text, result => {
          if (result.status !== Office.AsyncResultStatus.Succeeded) { reject(new Error('Could not read email')); return; }
          const subject = item.subject || '';
          const from = item.from ? (item.from.displayName + ' <' + item.from.emailAddress + '>') : '';
          resolve('Subject: '+subject+'\nFrom: '+from+'\n\n'+result.value);
        });
      });
    };

    const Badge = ({ c }) => {
      const map = { high:[GO,'#DCFCE7'], medium:[WARN,'#FEF3C7'], low:[DANGER,'#FEE2E2'] };
      const [fg, bg] = map[c] || map.low;
      return React.createElement('span', {
        style: { fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:99, color:fg, background:bg, whiteSpace:'nowrap' }
      }, c+' confidence');
    };

    const Suggestion = ({ item, baseline, log, onApply, onDismiss }) => {
      const [editing, setEditing] = useState(false);
      const [mid, setMid] = useState(item.matched_id||'');
      const [statusTo, setStatusTo] = useState(item.statusTo||'');
      const [month, setMonth] = useState(item.month||'');
      const [amount, setAmount] = useState(item.amount==null?'':item.amount);
      const [search, setSearch] = useState('');

      const eng = ROSTER.find(x => x.id===mid);
      const cur = useMemo(() => {
        if (!mid) return null;
        const st = { status: baseline[mid]?.status||'', months: {...(baseline[mid]?.months||{})} };
        log.forEach(e => { if (e.id!==mid) return; if (e.field==='Status') st.status=e.to; else st.months[e.field]=Number(e.to); });
        return st;
      }, [mid, baseline, log]);

      const noMatch = !mid;
      const fallbackAmount = item.amount !== undefined && item.amount !== null ? item.amount : '';
      const changed = mid!==(item.matched_id||'')||statusTo!==(item.statusTo||'')||month!==(item.month||'')||String(amount)!==String(fallbackAmount);
      const canApply = !noMatch && (statusTo||(month && amount!==''));
      const candidates = search ? ROSTER.filter(r => (r.client+' '+r.engagement+' '+r.id).toLowerCase().includes(search.toLowerCase())).slice(0,5) : [];

      const e = (tag, props, ...ch) => React.createElement(tag, props, ...ch);

      return e('div', { style:{background:'#fff',border:'1px solid '+(noMatch?'#FBCFE8':LINE),borderRadius:10,padding:12,marginBottom:10} },
        e('div', { style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:8} },
          e('div', { style:{minWidth:0,flex:1} },
            noMatch
              ? e('div', { style:{fontSize:12,fontWeight:600,color:WARN} }, '⚠ No match — search below')
              : e('div', { style:{fontSize:12} },
                  e('b', { style:{color:INK} }, eng?.client),
                  e('span', { style:{color:'#64748B'} }, ' / '+eng?.engagement),
                  e('span', { style:{fontSize:10,color:'#94A3B8',marginLeft:4} }, (eng?.owner||'')+' · '+mid)
                ),
            e('div', { style:{fontSize:11,color:'#64748B',marginTop:3} }, item.reasoning)
          ),
          e(Badge, { c: item.confidence })
        ),

        (editing||noMatch) && e('div', { style:{marginBottom:8,position:'relative'} },
          e('input', {
            value:search, onChange:ev=>setSearch(ev.target.value),
            placeholder:'Search client or engagement…',
            style:{width:'100%',border:'1px solid '+LINE,borderRadius:6,padding:'5px 8px',fontSize:12,outline:'none',boxSizing:'border-box'}
          }),
          candidates.length>0 && e('div', { position:'absolute',zIndex:10,background:'#fff',width:'100%',border:'1px solid '+LINE,borderRadius:6,marginTop:2,boxShadow:'0 4px 12px rgba(0,0,0,0.1)',maxHeight:180,overflowY:'auto'} },
            ...candidates.map(c => e('button', {
              key:c.id, onClick:()=>{setMid(c.id);setSearch('');},
              style:{display:'block',width:'100%',textAlign:'left',padding:'6px 10px',fontSize:11,borderBottom:'1px solid '+LINE,background:'none',cursor:'pointer',border:'none',borderBottom:'1px solid #F1F5F9'}
            }, e('span',{style:{color:'#94A3B8'}},c.id+' · '), e('b',null,c.client), e('span',{style:{color:'#94A3B8'}},' / '+c.engagement)))
          )
        ),

        e('div', { style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8} },
          e('div', { style:{background:BG,border:'1px solid '+LINE,borderRadius:8,padding:'8px 10px'} },
            e('div', { style:{fontSize:9,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6} }, 'Status'),
            editing
              ? e('select', { value:statusTo, onChange:ev=>setStatusTo(ev.target.value), style:{width:'100%',border:'1px solid '+LINE,borderRadius:5,padding:'3px 6px',fontSize:12} },
                  e('option',{value:''},'No change'),
                  ...STATUSES.map(s => e('option',{key:s,value:s},s))
                )
              : e('div', { style:{fontSize:12,display:'flex',alignItems:'center',gap:5,flexWrap:'wrap'} },
                  e('span',{style:{color:'#94A3B8'}},cur?.status||'(blank)'),
                  statusTo ? [e('span',{style:{color:'#CBD5E1'},key:'a'},'→'),e('b',{style:{color:GO},key:'b'},statusTo)]
                           : e('span',{style:{fontSize:11,color:'#CBD5E1'}},'no change')
                )
          ),
          e('div', { style:{background:BG,border:'1px solid '+LINE,borderRadius:8,padding:'8px 10px'} },
            e('div', { style:{fontSize:9,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6} }, 'Amount · Month'),
            editing
              ? e('div', { style:{display:'flex',gap:5} },
                  e('select', { value:month, onChange:ev=>setMonth(ev.target.value), style:{border:'1px solid '+LINE,borderRadius:5,padding:'3px 4px',fontSize:11} },
                    e('option',{value:''},'—'),
                    ...MONTHS.map(m => e('option',{key:m,value:m},m))
                  ),
                  e('input', { value:amount, onChange:ev=>setAmount(ev.target.value), type:'number', placeholder:'0', style:{width:70,border:'1px solid '+LINE,borderRadius:5,padding:'3px 6px',fontSize:12} })
                )
              : e('div', { style:{fontSize:12,display:'flex',alignItems:'center',gap:5,flexWrap:'wrap'} },
                  month
                    ? [e('span',{style:{fontSize:11,color:'#94A3B8'},key:'m'},month+':'),e('span',{style:{color:'#94A3B8'},key:'f'},money(cur?.months?.[month])),e('span',{style:{color:'#CBD5E1'},key:'a'},'→'),e('b',{style:{color:GO},key:'n'},money(amount))]
                    : e('span',{style:{fontSize:11,color:'#CBD5E1'}},'no amount')
            )
          )
        ),

        item.excerpt && e('div', { style:{fontSize:11,color:'#94A3B8',fontStyle:'italic',marginBottom:10} }, '"'+item.excerpt+'"'),

        e('div', { style:{display:'flex',gap:6,alignItems:'center'} },
          e('button', { onClick:()=>onApply(item,{matched_id:mid,statusTo,month,amount},changed), disabled:!canApply,
            style:{background:canApply?GO:'#94A3B8',color:'#fff',border:'none',borderRadius:7,padding:'7px 12px',fontSize:12,fontWeight:700,cursor:canApply?'pointer':'not-allowed'} }, '✓ Apply'),
          e('button', { onClick:()=>setEditing(v=>!v),
            style:{background:'#fff',color:INK,border:'1px solid '+LINE,borderRadius:7,padding:'7px 10px',fontSize:12,fontWeight:600,cursor:'pointer'} }, editing?'Done':'✎ Edit'),
          e('button', { onClick:onDismiss,
            style:{background:'none',color:'#94A3B8',border:'none',padding:'7px 10px',fontSize:12,cursor:'pointer',marginLeft:'auto'} }, 'Dismiss')
        )
      );
    };

    const LogRow = ({ e: entry }) => {
      const e = (tag, props, ...ch) => React.createElement(tag, props, ...ch);
      return e('div', { style:{display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderBottom:'1px solid '+LINE,fontSize:11,flexWrap:'wrap'} },
        e('span',{style:{color:'#94A3B8',width:36,flexShrink:0}},entry.time),
        e('span',{style:{color:'#94A3B8',width:54,flexShrink:0,fontVariantNumeric:'tabular-nums'}},entry.id),
        e('span',{style:{flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},
          e('b',null,entry.client), e('span',{style:{color:'#94A3B8'}},' / '+entry.engagement)),
        e('span',{style:{padding:'1px 5px',borderRadius:4,background:'#F1F5F9',color:'#475569',flexShrink:0,fontSize:10}},entry.field),
        e('span',{style:{display:'flex',alignItems:'center',gap:3,flexShrink:0,fontVariantNumeric:'tabular-nums'}},
          e('span',{style:{color:'#94A3B8'}}, entry.field==='Status'?entry.from:money(entry.from)),
          e('span',{style:{color:'#CBD5E1'}},'→'),
          e('b',{style:{color:GO}}, entry.field==='Status'?entry.to:money(entry.to))
        ),
        entry.edited && e('span',{style:{fontSize:9,padding:'1px 4px',borderRadius:3,background:'#FEF3C7',color:WARN}},'edited')
      );
    };

    const App = () => {
      const [tab, setTab] = useState('suggest');
      const [apiKey, setApiKey] = useState(() => recall('scl_key',''));
      const [showKey, setShowKey] = useState(!recall('scl_key',''));
      const [loading, setLoading] = useState(false);
      const [err, setErr] = useState(null);
      const [queue, setQueue] = useState(() => recall('scl_queue',[]));
      const [log, setLog] = useState(() => recall('scl_log',[]));

      const baseline = useMemo(() => {
        const m = {};
        ROSTER.forEach(r => { m[r.id] = { status:r.status||'', months:{...(r.months||{})} }; });
        return m;
      }, []);

      useEffect(() => { persist('scl_queue', queue); }, [queue]);
      useEffect(() => { persist('scl_log', log); }, [log]);
      useEffect(() => { persist('scl_key', apiKey); }, [apiKey]);

      const handleAnalyze = useCallback(async () => {
        if (!apiKey.trim()) { setErr('Enter your Anthropic API key first (⚙ above).'); return; }
        setLoading(true); setErr(null);
        try {
          setErr('Connecting to SharePoint…');
          try {
            const fresh = await fetchRosterFromSharePoint();
            if (fresh.length > 0) { ROSTER.length = 0; fresh.forEach(r => ROSTER.push(r)); }
            setErr(null);
          } catch(fetchErr) {
            const msg = fetchErr.message || (typeof fetchErr === 'object' ? JSON.stringify(fetchErr) : String(fetchErr));
            setErr('SharePoint setup message: ' + msg + ' — using cached roster context.');
          }
          
          const emailText = await getEmailText();
          const r = await window.callClaude(emailText, apiKey);
          
          if (!r.relevant) { setErr("No tracker update found in this email."); setLoading(false); return; }
          const eng = r.matched_id ? ROSTER.find(x=>x.id===r.matched_id) : null;
          setQueue(prev => [{
            qid: Date.now()+'',
            matched_id:r.matched_id, client:eng?.client||'', engagement:eng?.engagement||'', owner:eng?.owner||'',
            confidence:r.match_confidence||'low', statusTo:r.status_change?.to||'',
            month:r.amount_change?.month||'', amount:r.amount_change?.amount !== undefined ? r.amount_change.amount : '',
            reasoning:r.reasoning||'', excerpt:r.email_excerpt||'',
            emailSubject:emailText.match(/^Subject: (.+)/m)?.[1]||'',
            emailFrom:emailText.match(/^From: (.+)/m)?.[1]||'',
          }, ...prev]);
          setTab('suggest');
        } catch(ex) { 
          const finalMsg = ex.message || (typeof ex === 'object' ? JSON.stringify(ex) : String(ex));
          setErr('Analysis stop: ' + finalMsg); 
        }
        setLoading(false);
      }, [apiKey]);

      const writeToExcel = async (entries, token) => {
        const searchRes = await fetch(
          "https://graph.microsoft.com/v1.0/search/query",
          {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: [{ entityTypes: ['driveItem'], query: { queryString: '"AUTOMATION TEST - 260202 Rev Sheet"' }, size: 1 }]
            })
          }
        );
        const searchData = await searchRes.json();
        const hit = searchData.value?.[0]?.hitsContainers?.[0]?.hits?.[0];
        if (!hit) throw new Error('Could not find Excel file during write sync.');

        const fileId = hit.resource.id;
        const driveId = hit.resource.parentReference.driveId;

        const hdrsRes = await fetch(
          `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/workbook/tables/tblRevenue/columns`,
          { headers: { Authorization: 'Bearer ' + token } }
        );
        const hdrsData = await hdrsRes.json();
        
        const localColMap = {};
        (hdrsData.value || []).forEach(c => { 
          localColMap[c.name] = c.index;
          const clean = c.name.toLowerCase().replace(/[\s_\-]/g, '');
          localColMap[clean] = c.index;
        });

        const targetIdKey = localColMap['EngagementID'] !== undefined ? 'EngagementID' : 'engagementid';
        const targetStatusKey = localColMap['Status'] !== undefined ? 'Status' : 'status';

        const rowsRes = await fetch(
          `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/workbook/tables/tblRevenue/rows`,
          { headers: { Authorization: 'Bearer ' + token } }
        );
        const rowsData = await rowsRes.json();
        const rows = rowsData.value || [];

        const eidCol = localColMap[targetIdKey];
        const results = [];

        for (const entry of entries) {
          const rowIdx = rows.findIndex(r => String(r.values[0][eidCol]) === entry.id);
          if (rowIdx === -1) { results.push({ id: entry.id, ok: false, err: 'Row not found' }); continue; }

          const colIdx = entry.field === 'Status' ? localColMap[targetStatusKey] : (localColMap[entry.field] !== undefined ? localColMap[entry.field] : localColMap[entry.field.toLowerCase()]);
          if (colIdx === undefined) { results.push({ id: entry.id, ok: false, err: 'Column not found: ' + entry.field }); continue; }

          const patchRes = await fetch(
            `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/workbook/tables/tblRevenue/rows/itemAt(index=${rowIdx})`,
            {
              method: 'PATCH',
              headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                values: [rows[rowIdx].values[0].map((v, i) => i === colIdx ? entry.to : v)]
              })
            }
          );
          results.push({ id: entry.id, field: entry.field, ok: patchRes.ok });

          try {
            await fetch(
              `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/workbook/tables/tblChangeLog/rows`,
              {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  values: [[
                    entry.date, entry.time,
                    entry.client + ' / ' + entry.engagement + ' — ' + entry.field + ' updated',
                    entry.field, String(entry.from), String(entry.to),
                    entry.edited ? 'Reviewed & edited' : 'Approved as suggested',
                    'EngagementID: ' + entry.id + ' | Confidence: ' + entry.confidence,
                    entry.emailSubject || '', entry.emailFrom || '',
                    entry.reasoning || '', entry.excerpt || '', entry.confidence || ''
                  ]]
                })
              }
            );
          } catch(_) {}
        }
        return results;
      };

      const applyItem = async (item, edited, wasEdited) => {
        const now = new Date();
        const date=now.toISOString().slice(0,10), time=now.toTimeString().slice(0,5);
        const eng = ROSTER.find(x=>x.id===edited.matched_id);
        const logForId = log.filter(e=>e.id===edited.matched_id);
        const curStatus = logForId.filter(e=>e.field==='Status').slice(-1)[0]?.to || baseline[edited.matched_id]?.status||'';
        
        let baseMonthVal = null;
        if (baseline[edited.matched_id] && baseline[edited.matched_id].months) {
          baseMonthVal = baseline[edited.matched_id].months[edited.month];
        }
        const lastLogVal = logForId.filter(e=>e.field===edited.month).slice(-1)[0]?.to;
        const curMonth = edited.month ? (lastLogVal !== undefined ? lastLogVal : (baseMonthVal !== undefined ? baseMonthVal : null)) : null;
        
        const entries = [];
        if (edited.statusTo && edited.statusTo!==curStatus)
          entries.push({date,time,id:edited.matched_id,client:eng?.client||'',engagement:eng?.engagement||'',field:'Status',from:curStatus||'(blank)',to:edited.statusTo,confidence:item.confidence,edited:wasEdited,emailSubject:item.emailSubject||'',emailFrom:item.emailFrom||'',reasoning:item.reasoning||'',excerpt:item.excerpt||''});
        if (edited.month && edited.amount!==''&&edited.amount!==null && Number(curMonth)!==Number(edited.amount))
          entries.push({date,time,id:edited.matched_id,client:eng?.client||'',engagement:eng?.engagement||'',field:edited.month,from:curMonth !== null ? curMonth : '(blank)',to:Number(edited.amount),confidence:item.confidence,edited:wasEdited,emailSubject:item.emailSubject||'',emailFrom:item.emailFrom||'',reasoning:item.reasoning||'',excerpt:item.excerpt||''});
        if (!entries.length) { setQueue(prev=>prev.filter(x=>x.qid!==item.qid)); return; }

        try {
          const token = await getGraphToken();
          const results = await writeToExcel(entries, token);
          if (!results.every(r => r.ok)) {
            setErr('Some spreadsheet cell writes failed.');
          }
        } catch(writeErr) {
          setErr('Excel write failed: ' + writeErr.message);
        }

        setLog(prev=>[...entries,...prev]);
        setQueue(prev=>prev.filter(x=>x.qid!==item.qid));
      };

      const e = (tag, props, ...ch) => React.createElement(tag, props, ...ch);

      return e('div', { style:{minHeight:'100vh',background:BG} },
        e('div', { style:{background:'#fff',borderBottom:'1px solid '+LINE,padding:'10px 12px'} },
          e('div', { style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6} },
            e('div', { style:{fontSize:13,fontWeight:700,color:INK,letterSpacing:'-0.01em'} }, 'SCL Revenue Tracker'),
            e('div',{style:{fontSize:10,color:'#94A3B8',marginTop:1}}, ROSTER.length ? ROSTER.length+' engagements (live)' : 'Will load from SharePoint on Analyze'),
            e('button', { onClick:()=>setShowKey(v=>!v), style:{fontSize:11,color:'#94A3B8',background:'none',border:'none',cursor:'pointer'} }, '⚙ API key')
          ),
          showKey && e('div', { style:{marginBottom:8} },
            e('div',{style:{fontSize:10,color:'#94A3B8',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}},'Anthropic API key'),
            e('input', {
              value:apiKey, onChange:ev=>setApiKey(ev.target.value),
              type:'password', placeholder:'sk-ant-…',
              style:{width:'100%',border:'1px solid '+LINE,borderRadius:6,padding:'5px 8px',fontSize:12,outline:'none',marginBottom:8,boxSizing:'border-box'}
            }),
            e('div',{style:{fontSize:10,color:'#94A3B8',marginTop:3}}, '✓ Writes directly to Excel on SharePoint via Microsoft Graph')
          ),
          e('button', {
            onClick:handleAnalyze, disabled:loading,
            style:{width:'100%',background:loading?'#94A3B8':INK,color:'#fff',border:'none',borderRadius:7,padding:'9px',fontSize:13,fontWeight:700,cursor:loading?'not-allowed':'pointer',marginBottom:8}
          }, loading ? '⏳ Analyzing…' : '▶  Analyze this email'),
          err && e('div',{style:{fontSize:11,color:DANGER,marginBottom:6}},err),
          e('div', { style:{display:'flex',gap:4} },
            ...[ ['suggest','Suggestions',queue.length], ['log','Change log',0] ].map(([k,label,badge]) =>
              e('button', { key:k, onClick:()=>setTab(k),
                style:{flex:1,padding:'5px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',border:'none',
                       background:tab===k?INK:'#F1F5F9',color:tab===k?'#fff':'#475569'} },
                badge>0 ? label+' ('+badge+')' : label)
            )
          )
        ),

        e('div', { style:{padding:10} },
          tab==='suggest'
            ? (queue.length===0
                ? e('div',{style:{textAlign:'center',color:'#94A3B8',paddingTop:40,fontSize:12,lineHeight:'1.6'}},'Open an email and press\n▶ Analyze this email')
                : queue.map(item => e(Suggestion, { key:item.qid, item, baseline, log, onApply:applyItem, onDismiss:()=>setQueue(prev=>prev.filter(x=>x.qid!==item.qid)) }))
              )
            : e('div', { style:{background:'#fff',border:'1px solid '+LINE,borderRadius:10,overflow:'hidden'} },
                e('div', { style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',borderBottom:'1px solid '+LINE} },
                  e('div',{style:{fontSize:12,fontWeight:600,color:INK}},log.length+' changes'),
                  e('button', {
                    onClick:()=>{
                      const h='Date,Time,ID,Client,Engagement,Field,From,To,Confidence,Edited,Email Subject,Email Sender,Claude Reasoning,Email Excerpt';
                      const esc=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
                      const rows=[...log].reverse().map(entry=>[entry.date,entry.time,entry.id,entry.client,entry.engagement,entry.field,entry.from,entry.to,entry.confidence,entry.edited?'yes':'no',entry.emailSubject||'',entry.emailFrom||'',entry.reasoning||'',entry.excerpt||''].map(esc).join(','));
                      const b=new Blob([[h,...rows].join('\n')],{type:'text/csv'});
                      const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='SCL_ChangeLog.csv';a.click();
                    },
                    style:{fontSize:11,padding:'3px 8px',borderRadius:5,border:'1px solid '+LINE,background:'none',cursor:'pointer',color:INK}
                  },'↓ CSV')
                ),
                log.length===0
                  ? e('div',{style:{textAlign:'center',color:'#94A3B8',padding:24,fontSize:12}},'No changes applied yet.')
                  : log.map((entry,i) => e(LogRow,{key:i, e:entry}))
              )
        )
      );
    };

    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));

  } catch (bootErr) {
    showFatalCrashMessage(bootErr);
  }
}

function showFatalCrashMessage(err) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding:20px; font-family:sans-serif; color:#B91C1C; background:#FEF2F2; border:1px solid #FEE2E2; border-radius:8px; margin:10px;">
        <h4 style="margin:0 0 8px 0; font-size:14px;">Add-in Load Failure</h4>
        <p style="margin:0 0 12px 0; font-size:12px; color:#475569; line-height:1.5;">The script encountered an initialization error before React could mount.</p>
        <code style="display:block; background:#fff; padding:8px; border-radius:4px; font-size:11px; border:1px solid #FCA5A5; white-space:pre-wrap;">${err.stack || err.message || err}</code>
      </div>
    `;
  }
}

Office.onReady((info) => {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    bootstrapSCLAddIn();
  } else {
    window.addEventListener('DOMContentLoaded', bootstrapSCLAddIn);
  }
});
