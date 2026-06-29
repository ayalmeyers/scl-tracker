const { useState, useEffect, useCallback, useMemo } = React;
const ROSTER = [{"id":"ENG-001","client":"AEA Investors","engagement":"V. Kumar","owner":"FM","status":"Paid","months":{"Jan":5000,"Feb":5000,"Mar":5000,"Apr":5000}},{"id":"ENG-002","client":"AG Limited","engagement":"Presentation Skills Dev","owner":"JT","status":"","months":{"May":16500}},{"id":"ENG-003","client":"Alix Partners","engagement":"MD Promotes","owner":"SJC / JT","status":"","months":{}},{"id":"ENG-004","client":"Alix Partners","engagement":"EC: Satchi Mishra","owner":"SJC","status":"Invoiced","months":{"Mar":1782,"Apr":3563,"May":3563,"Jun":3563,"Jul":3563,"Aug":3560,"Sept":1781}},{"id":"ENG-005","client":"Alix Partners","engagement":"EC: Catherine Nekavand","owner":"SJC","status":"","months":{"Apr":4125,"May":4125,"Jun":4125,"Jul":4125}},{"id":"ENG-006","client":"Alix Partners","engagement":"EC: Yale Kwon","owner":"SJC","status":"","months":{"Jun":3563,"Jul":0,"Aug":3563,"Sept":3563,"Oct":3563,"Nov":3563}},{"id":"ENG-007","client":"Alix Partners","engagement":"Accelerator Webinars","owner":"SJC","status":"Invoiced","months":{"Jan":4000}},{"id":"ENG-008","client":"Altaris","engagement":"Junior Comms Skills Coaching","owner":"SJC","status":"","months":{}},{"id":"ENG-009","client":"Altaris","engagement":"Lana","owner":"SJC","status":"","months":{}},{"id":"ENG-010","client":"Altaris","engagement":"Julia","owner":"SJC","status":"","months":{}},{"id":"ENG-011","client":"Altaris","engagement":"Brendan","owner":"SJC","status":"","months":{}},{"id":"ENG-012","client":"Altaris","engagement":"Mike","owner":"SJC","status":"","months":{}},{"id":"ENG-013","client":"Aquiline","engagement":"LPAC Meeting Preparation ","owner":"SJC","status":"","months":{}},{"id":"ENG-014","client":"Aquiline","engagement":"Morgan Heilshorn","owner":"SJC","status":"Paid","months":{"Feb":3000,"Mar":3000}},{"id":"ENG-015","client":"Aquiline","engagement":"Grant","owner":"SJC","status":"Paid","months":{"Feb":3000,"Mar":3000}},{"id":"ENG-016","client":"Aquiline","engagement":"Harry","owner":"SJC","status":"Paid","months":{"Feb":3000,"Mar":3000,"Apr":3000}},{"id":"ENG-017","client":"Aquiline","engagement":"Mike","owner":"SJC","status":"Paid","months":{"Feb":3000,"Mar":3000}},{"id":"ENG-018","client":"Aquiline","engagement":"Giovanni Nonni","owner":"SJC","status":"","months":{"May":1500,"Jun":3000,"Jul":3000,"Aug":1500}},{"id":"ENG-019","client":"Argonne Capital","engagement":"The Perfect Light SD","owner":"SJ / JT","status":"","months":{"Mar":11500}},{"id":"ENG-020","client":"Argonne Capital","engagement":"The Perfect Light EC CEO","owner":"SJ / JT","status":"","months":{"Jun":3083,"Jul":3083,"Aug":3083,"Sept":3083,"Oct":3083,"Nov":3085}},{"id":"ENG-021","client":"Argonne Capital","engagement":"The Perfect Light EC CFO","owner":"SJ / JT","status":"","months":{"Jun":3083,"Jul":3083,"Aug":3083,"Sept":3083,"Oct":3083,"Nov":3085}},{"id":"ENG-022","client":"Argonne Capital","engagement":"The Perfect Light EC CPO","owner":"SJ / JT","status":"","months":{"Jun":3083,"Jul":3083,"Aug":3083,"Sept":3083,"Oct":3083,"Nov":3085}},{"id":"ENG-023","client":"Argonne Capital","engagement":"The Perfect Light EC COO","owner":"SJ / JT","status":"","months":{"Jun":3083,"Jul":3083,"Aug":3083,"Sept":3083,"Oct":3883,"Nov":3085}},{"id":"ENG-024","client":"Argonne Capital","engagement":"The Perfect Light Event Rehearsals","owner":"SJ / JT","status":"","months":{"Jun":1750,"Jul":1750,"Aug":1750,"Sept":1750,"Oct":1750,"Nov":1750}},{"id":"ENG-025","client":"Argonne Capital","engagement":"EC Mitchell gratis","owner":"SJ / JT","status":"","months":{}},{"id":"ENG-026","client":"AWSOM (Heartland)","engagement":"Sharmilla Makhija Coaching","owner":"FM","status":"SOW/Pending","months":{"Jan":6167,"Feb":6167,"Mar":6167}},{"id":"ENG-027","client":"Audax","engagement":"Skills Development Session - TBD","owner":"SJ / JT","status":"","months":{}},{"id":"ENG-028","client":"Barclay's","engagement":"Sereen Ahmed","owner":"FM","status":"Paid","months":{}},{"id":"ENG-029","client":"Barclay's","engagement":"M. McLean","owner":"SJC / JT","status":"Invoiced","months":{"Feb":1250}},{"id":"ENG-030","client":"Barclay's","engagement":"A. Keches","owner":"SJC / JT","status":"Invoiced","months":{"Feb":1250}},{"id":"ENG-031","client":"Barclay's","engagement":"Sm. Group Media Training","owner":"SJC","status":"","months":{"Mar":3000}},{"id":"ENG-032","client":"Barclay's","engagement":"Adrienne Yih","owner":"SJC","status":"","months":{"Mar":1250}},{"id":"ENG-033","client":"Barclay's","engagement":"Torstein Berteig","owner":"SJC","status":"","months":{"Mar":1250}},{"id":"ENG-034","client":"Barclay's","engagement":"David Garner","owner":"SJC","status":"","months":{"Mar":1500,"Apr":3000,"May":3000}},{"id":"ENG-035","client":"Barclay's","engagement":"UK Media Training","owner":"SJC","status":"","months":{}},{"id":"ENG-036","client":"Barclay's","engagement":"UK Pitch Skills","owner":"SJC","status":"","months":{}},{"id":"ENG-037","client":"Barclay's","engagement":"Oksana Poltavets","owner":"SJC","status":"SOW/Pending","months":{}},{"id":"ENG-038","client":"Barclay's","engagement":"Sofia Rehman","owner":"SJC","status":"","months":{}},{"id":"ENG-039","client":"Barclay's","engagement":"Mike Webb","owner":"FM","status":"","months":{"Feb":3300,"Mar":3300,"Apr":3300}},{"id":"ENG-040","client":"Barclay's","engagement":"Anne Marie Darling","owner":"FM / SJC","status":"","months":{"Jan":1500,"Feb":3000,"Mar":3000}},{"id":"ENG-041","client":"Blackstone","engagement":"Owen Parker","owner":"FM","status":"Invoiced","months":{"Jan":5000,"Feb":5000}},{"id":"ENG-042","client":"Blackstone","engagement":"Kaoru Fujita","owner":"FM / MB","status":"Invoiced","months":{"Mar":5833,"Apr":5835,"May":5833,"Jun":5833,"Jul":5833,"Aug":5833}},{"id":"ENG-043","client":"Blackstone","engagement":"BXMA Difficult Conversations Session","owner":"FM / SJC","status":"Invoiced","months":{"Feb":15000}},{"id":"ENG-044","client":"Blackstone","engagement":"BX HR Leadership Offsite","owner":"FM / SJC","status":"","months":{}},{"id":"ENG-045","client":"Blackstone","engagement":"BXRE","owner":"MB","status":"","months":{"Jul":8500}},{"id":"ENG-046","client":"Blackstone","engagement":"BXCI SMD  Offsite","owner":"FM / SJC","status":"Other","months":{}},{"id":"ENG-047","client":"BNP Paribas","engagement":"Virtual L&D Programs ( Neg Skills)","owner":"SJC","status":"","months":{"Jun":4500,"Oct":4500}},{"id":"ENG-048","client":"BNP Paribas","engagement":"Virtual L&D Programs (Pitch Skills)","owner":"SJC / JT","status":"","months":{"Mar":7500,"Sept":7500}},{"id":"ENG-049","client":"BNP Paribas","engagement":"Client Edge Series","owner":"SJC / JT","status":"","months":{}},{"id":"ENG-050","client":"BNP Paribas","engagement":"Yannick Jung","owner":"FM","status":"Invoiced","months":{"Jan":5000,"Feb":5000,"Mar":5000,"Apr":5000,"May":5000,"Jun":5000}},{"id":"ENG-051","client":"BNP Paribas","engagement":"Julie Watremez","owner":"FM","status":"Paid","months":{"Jan":2250,"Feb":2250}},{"id":"ENG-052","client":"CBRE","engagement":"Adam Gallistel EC","owner":"FM","status":"Invoiced","months":{"Jan":6167,"Feb":6167,"Mar":6167}},{"id":"ENG-053","client":"CBRE","engagement":"Press Conference Prep","owner":"SJC / JT","status":"","months":{"Mar":5000,"Apr":5000}},{"id":"ENG-054","client":"Consello","engagement":"EC: Lizzie Langer","owner":"JT","status":"Paid","months":{"Jan":5000,"Feb":5000,"Mar":5000,"Apr":5000,"May":5000,"Jun":5000}},{"id":"ENG-055","client":"Consello","engagement":"EC: Nishi","owner":"JT","status":"Paid","months":{"Jan":5500,"Feb":5500,"Mar":5500,"May":2750,"Jun":5500,"Jul":5500,"Aug":2750}},{"id":"ENG-056","client":"Corient Private Wealth","engagement":"EC: Juan","owner":"SD","status":"Paid","months":{"Jan":5000,"Feb":5000,"Mar":5000,"Apr":5000,"May":5000}},{"id":"ENG-057","client":"Corient Private Wealth","engagement":"EC: Elliot & Kreso","owner":"SD","status":"Paid","months":{"Jan":5000,"Feb":5000,"Mar":5000}},{"id":"ENG-058","client":"Corient Private Wealth","engagement":"EC: Fernando","owner":"SD","status":"Paid","months":{"Jan":5000,"Feb":5000,"Mar":5000}},{"id":"ENG-059","client":"Corient Private Wealth","engagement":"Francisco Team - 2 75-minute sessions","owner":"SD","status":"Paid","months":{"May":1500,"Jul":1500}},{"id":"ENG-060","client":"Corient Private Wealth","engagement":"Francisco Team Offsite","owner":"FM / SD","status":"Invoiced","months":{"Mar":23000}},{"id":"ENG-061","client":"Corient Private Wealth","engagement":"Performance Review","owner":"SD / SJC / JT","status":"Paid","months":{"Jan":25500}},{"id":"ENG-062","client":"datacenterHawk","engagement":"Project Featherstone Pitch Consulting (Leeds/ Solomon)","owner":"SJC / JT","status":"Part Paid","months":{"Feb":12500,"May":3500,"Jun":20000,"Jul":8500}},{"id":"ENG-063","client":"Elevance Health","engagement":"EC: Nathan Rich","owner":"SJC","status":"Part Paid","months":{"Jan":5000,"Feb":5000,"Apr":834,"May":1667,"Jun":1667,"Jul":1667,"Aug":1667,"Sept":1667,"Oct":1667,"Nov":1667,"Dec":834}},{"id":"ENG-064","client":"Elliott Management","engagement":"UK Communication","owner":"SJC","status":"Invoiced","months":{}},{"id":"ENG-065","client":"Elliott Management","engagement":"EC: Bess Hawker","owner":"SJC","status":"Paid","months":{"Jan":5500,"Feb":5500}},{"id":"ENG-066","client":"Elliott Management","engagement":"EC: Chris Singh","owner":"SJC","status":"Invoiced","months":{"Feb":5500,"Mar":5500,"Apr":5500}},{"id":"ENG-067","client":"Elliott Management","engagement":"EC: TBD","owner":"SJC","status":"","months":{}},{"id":"ENG-068","client":"Estee Lauder","engagement":"Akhil Shrivastava EC","owner":"FM / SJC","status":"Invoiced","months":{"Jan":4167,"Feb":4167,"Mar":4167}},{"id":"ENG-069","client":"Evercore","engagement":"Corporate Functions - New Managers Sessions ","owner":"SJC","status":"Invoiced","months":{"Apr":5500,"May":5500}},{"id":"ENG-070","client":"Evercore","engagement":"Corporate Functions - Experienced Managers Leadership Sessions","owner":"SJC","status":"","months":{}},{"id":"ENG-071","client":"Evercore","engagement":"Associate Leadership Session","owner":"SJC","status":"","months":{}},{"id":"ENG-072","client":"Evercore","engagement":"Secrets of an Executive Coach","owner":"SJC","status":"","months":{}},{"id":"ENG-073","client":"Evercore","engagement":"Pranav Goel","owner":"FM","status":"Invoiced","months":{"Feb":4125,"Mar":4125}},{"id":"ENG-074","client":"Evercore","engagement":"Jarrett Vitulli","owner":"FM","status":"Paid","months":{"Jan":2417,"Feb":2417,"Mar":2417}},{"id":"ENG-075","client":"Evercore","engagement":"Ahmet Yetis","owner":"FM","status":"Paid","months":{"Jan":7500}},{"id":"ENG-076","client":"Franklin Templeton","engagement":"S. Kaul","owner":"FM","status":"Invoiced","months":{"Jan":6000,"Feb":6000,"Mar":6000}},{"id":"ENG-077","client":"Glean","engagement":"Arvind Jain","owner":"FM","status":"","months":{}},{"id":"ENG-078","client":"Grayscale Operating, LLC","engagement":"P. Mintzberg EC","owner":"SJC","status":"Invoiced","months":{"Jan":5833,"Feb":5833,"Mar":5833,"Apr":5833,"May":5833,"Jun":5833}},{"id":"ENG-079","client":"Latham & Watkins","engagement":"Andrew Parlen","owner":"FM","status":"Invoiced","months":{"Jan":5000,"Feb":5000,"Mar":5000}},{"id":"ENG-080","client":"Latham & Watkins","engagement":"Andrew Parlen Biz Dev","owner":"SJC","status":"Invoiced","months":{"Apr":6167,"May":6166,"Jun":6167}},{"id":"ENG-081","client":"Medecision","engagement":"Ken Young","owner":"FM","status":"SOW/Pending","months":{"Jan":5000,"Feb":5000,"Mar":5000,"Jun":4286,"Jul":4286,"Aug":4286,"Sept":4286,"Oct":4286,"Nov":4286,"Dec":4286}},{"id":"ENG-082","client":"Medecision","engagement":"Leadership Team Development","owner":"FM / JT","status":"Invoiced","months":{"Jan":16150,"Jun":16150}},{"id":"ENG-083","client":"Medecision","engagement":"EC: Tanya, Zach, Scott & Team","owner":"JZ","status":"Invoiced","months":{"Jan":11250,"Feb":11250,"Mar":11250,"Apr":11250}},{"id":"ENG-084","client":"Medecision","engagement":"EC: Sam Abrams","owner":"JT","status":"Invoiced","months":{"Jan":5625,"Feb":5625,"Mar":5625,"Apr":5625,"Jun":5000,"Jul":5000,"Aug":5000,"Sept":5000,"Oct":5000,"Nov":5000}},{"id":"ENG-085","client":"Million Air","engagement":"management Team PC","owner":"SJC / JT","status":"","months":{"Jun":6250,"Jul":6250}},{"id":"ENG-086","client":"Moelis*","engagement":"SD Sessions US ","owner":"SJC","status":"","months":{"Jan":7000,"Feb":7000}},{"id":"ENG-087","client":"Moelis*","engagement":"SD Sessions UK","owner":"SJC","status":"","months":{"Feb":12438}},{"id":"ENG-088","client":"Moelis*","engagement":"1:1  EC  UK","owner":"SJC","status":"","months":{"Jan":9563,"Feb":8500}},{"id":"ENG-089","client":"Moelis*","engagement":"1:1 EC  US","owner":"SJC","status":"Invoiced","months":{"Feb":5313,"Mar":2550,"Apr":4250,"May":2125}},{"id":"ENG-090","client":"Moelis*","engagement":"MD Development Day","owner":"SJC","status":"","months":{}},{"id":"ENG-091","client":"Moelis*","engagement":"Moelis UK Womens Pilot Program","owner":"SJC","status":"","months":{}},{"id":"ENG-092","client":"Moelis*","engagement":"Moelis UK Associates Session","owner":"SJC","status":"","months":{}},{"id":"ENG-093","client":"Moelis*","engagement":"Bay Club Management Team","owner":"SJC / JT","status":"","months":{}},{"id":"ENG-094","client":"Moelis*","engagement":"Greg Gordon","owner":"FM","status":"Invoiced","months":{"Mar":750}},{"id":"ENG-095","client":"Nomura","engagement":"EC - Vijay Sundaram","owner":"SJC","status":"","months":{}},{"id":"ENG-096","client":"OptionMetrics","engagement":"Project Quantis  (Solomon & Leeds)","owner":"SJC / JT","status":"Part Paid","months":{"Jan":10000,"Feb":2500,"May":3500,"Jun":20000,"Jul":8500}},{"id":"ENG-097","client":"Paul Weiss","engagement":"New Partner Pitch Skills Session","owner":"FM / SJC","status":"Paid","months":{"Apr":5500}},{"id":"ENG-098","client":"Paul Weiss","engagement":"UK New Partners Pitch Session","owner":"FM","status":"Paid","months":{}},{"id":"ENG-099","client":"Paul Weiss","engagement":"David Pritchett","owner":"FM","status":"Paid","months":{"Jan":5000,"Feb":5000,"Mar":5000}},{"id":"ENG-100","client":"Paul Weiss","engagement":"Chris Wilson","owner":"JT","status":"Invoiced","months":{"Jan":3750,"Feb":3750}},{"id":"ENG-101","client":"Paul Weiss","engagement":"Matt Bennedetto","owner":"JT","status":"Invoiced","months":{"Jan":5000,"Feb":5000,"Mar":5000}},{"id":"ENG-102","client":"Paul Weiss","engagement":"Neel Sachdev","owner":"FM","status":"Invoiced","months":{"Jan":4500,"Feb":4500,"Mar":4500,"Jun":4500,"Jul":4500,"Aug":4500,"Sept":4500,"Oct":4500,"Nov":4500,"Dec":4500}},{"id":"ENG-103","client":"Paul Weiss","engagement":"Roger Johnson","owner":"FM","status":"Invoiced","months":{"Jan":5000,"Feb":5000,"Mar":5000,"Apr":5000}},{"id":"ENG-104","client":"Paul Weiss","engagement":"Jeremy Leggate","owner":"FM","status":"Invoiced","months":{"Jan":6167,"Feb":667,"Mar":6167}},{"id":"ENG-105","client":"PLAID","engagement":"EC - Zach Perret","owner":"FM","status":"Invoiced","months":{}},{"id":"ENG-106","client":"Proskauer","engagement":"Sarah Stasny","owner":"FM","status":"","months":{}},{"id":"ENG-107","client":"Proskauer","engagement":"Sarah Stasny & Team Biz Dev","owner":"SJC","status":"","months":{}},{"id":"ENG-108","client":"PVT","engagement":"Beau Harbor","owner":"FM","status":"","months":{"Jan":1250,"Feb":1250,"Mar":1250}},{"id":"ENG-109","client":"PVT","engagement":"Gavin Hood","owner":"FM","status":"Paid","months":{"Jan":4000,"Feb":4000,"Mar":4000}},{"id":"ENG-110","client":"Ralph Lauren*","engagement":"GCC Team (Katie)","owner":"SJC","status":"","months":{}},{"id":"ENG-111","client":"Ralph Lauren*","engagement":"Patrice Louvet","owner":"FM","status":"","months":{}},{"id":"ENG-112","client":"Ralph Lauren*","engagement":"Fin Comm - Clara","owner":"SJC","status":"","months":{"Apr":12500}},{"id":"ENG-113","client":"Ralph Lauren*","engagement":"Anette Rust","owner":"SJC","status":"Invoiced","months":{"Apr":8500}},{"id":"ENG-114","client":"Ralph Lauren*","engagement":"Dara Douglas","owner":"SJC","status":"SOW/Pending","months":{"Mar":5000,"Apr":5000,"May":5000,"Jun":5000}},{"id":"ENG-115","client":"Ralph Lauren*","engagement":"Toni","owner":"SJC","status":"","months":{}},{"id":"ENG-116","client":"Ralph Lauren*","engagement":"Karen Ford Offsite","owner":"SJC","status":"","months":{}},{"id":"ENG-117","client":"Ralph Lauren*","engagement":"Halide","owner":"SJC","status":"","months":{}},{"id":"ENG-118","client":"Ralph Lauren*","engagement":"Sasha Kelly Team Offsite","owner":"SJC","status":"","months":{}},{"id":"ENG-119","client":"Ralph Lauren*","engagement":"Cultural & IP Training Session","owner":"SJC","status":"","months":{}},{"id":"ENG-120","client":"Ralph Lauren*","engagement":"Global Buying Team Offsite (Niall)","owner":"SJC","status":"","months":{"Apr":5500}},{"id":"ENG-121","client":"Ralph Lauren*","engagement":"EC - Fred Dechnik","owner":"FM","status":"","months":{}},{"id":"ENG-122","client":"RBC","engagement":"2025 Community Investments' Offsite Savannah","owner":"FM","status":"","months":{}},{"id":"ENG-123","client":"Rubrik","engagement":"Bipul","owner":"FM","status":"Invoiced","months":{"Jan":2500,"Feb":2500,"Mar":2500,"Apr":2500,"May":2500,"Jun":2500,"Jul":2500,"Aug":2500,"Sept":2500,"Oct":2500,"Nov":2500,"Dec":2500}},{"id":"ENG-124","client":"Silver Point Capital","engagement":"JT Davis","owner":"FM","status":"","months":{"Jan":1446,"Feb":1446,"Mar":1446}},{"id":"ENG-125","client":"Sixth Street","engagement":"Alan Waxman","owner":"FM","status":"","months":{}},{"id":"ENG-126","client":"Sixth Street","engagement":"EC: Kelly Marshall","owner":"SJC","status":"Invoiced","months":{"Mar":4000,"Apr":4000}},{"id":"ENG-127","client":"Sixth Street","engagement":"Bo Stanley","owner":"SJC","status":"","months":{}},{"id":"ENG-128","client":"Sixth Street","engagement":"Investor Day Debrief","owner":"FM / SJC","status":"","months":{"Jan":5000,"Feb":3600}},{"id":"ENG-129","client":"Sixth Street","engagement":"Investor Day Prep","owner":"SJC / JT","status":"","months":{}},{"id":"ENG-130","client":"Solomon Partners","engagement":"MD  Skills Program - new promotes","owner":"SJC / JT","status":"","months":{}},{"id":"ENG-131","client":"Solomon Partners","engagement":"MD Skills Program - new hires","owner":"SJC / JT","status":"","months":{}},{"id":"ENG-132","client":"Solomon Partners","engagement":"Media Training","owner":"SJC","status":"","months":{}},{"id":"ENG-133","client":"Stanford Healthcare*","engagement":"Michiko Tanabe & Team","owner":"FM / SJ","status":"","months":{"Jan":7458,"Feb":7458,"Mar":7458,"Apr":7458,"May":7458,"Jun":7458,"Jul":7458,"Aug":7458}},{"id":"ENG-134","client":"Stanford University*","engagement":"Dean Minor","owner":"FM","status":"Paid","months":{"Jan":1013}},{"id":"ENG-135","client":"Stanford University*","engagement":"Dean Minor SoM Leadership Retreat","owner":"FM","status":"Paid","months":{"Feb":10500}},{"id":"ENG-136","client":"Stanford University*","engagement":"Jennifer Zimbroff","owner":"FM","status":"","months":{}},{"id":"ENG-137","client":"Stanford University*","engagement":"Priya Singh","owner":"FM","status":"Paid","months":{"Jan":5375,"Feb":5375,"Aug":5375,"Sept":5375,"Oct":5375,"Nov":5375,"Dec":5375}},{"id":"ENG-138","client":"Stanford University*","engagement":"Priya Singh - Stephanie","owner":"SD","status":"Paid","months":{"Jan":5375,"Feb":5375,"Mar":5375,"Apr":5375,"May":5375,"Jun":5375}},{"id":"ENG-139","client":"Stanford University*","engagement":"Euan Ashley","owner":"FM","status":"Paid","months":{"Jan":4583,"Feb":4583}},{"id":"ENG-140","client":"Stanford University*","engagement":"Umar Mahmood","owner":"FM","status":"Invoiced","months":{"Jan":7500,"Feb":7500,"Mar":5000}},{"id":"ENG-141","client":"Stanford University*","engagement":"Umar Mahmood","owner":"SD","status":"Invoiced","months":{"Mar":5000,"Apr":7500,"May":7500}},{"id":"ENG-142","client":"Stanford University*","engagement":"Joe Liao","owner":"FM","status":"Paid","months":{"Jan":3750,"Feb":3750,"Mar":3750}},{"id":"ENG-143","client":"Stanford University*","engagement":"Joe Liao","owner":"SD","status":"Other","months":{}},{"id":"ENG-144","client":"Stanford University*","engagement":"Caitlin McIsaac","owner":"SJC","status":"Invoiced","months":{"Jan":1200,"Feb":1200,"Mar":1200}},{"id":"ENG-145","client":"Stanford University*","engagement":"Meghan Marx","owner":"SJC","status":"Invoiced","months":{"Jan":1200,"Feb":1200,"Mar":1200}},{"id":"ENG-146","client":"Stanford University*","engagement":"Brian Bateman","owner":"FM","status":"Invoiced","months":{"Jan":5833,"Feb":5833}},{"id":"ENG-147","client":"Stanford University*","engagement":"President Levin","owner":"FM","status":"","months":{}},{"id":"ENG-148","client":"Stanford University*","engagement":"Communications Leadership Team","owner":"SJC","status":"","months":{}},{"id":"ENG-149","client":"Stanford University*","engagement":"Terrance Mayes","owner":"FM","status":"Invoiced","months":{"Jan":1157,"Feb":1157,"Mar":1157}},{"id":"ENG-150","client":"Stanford University*","engagement":"Jean Sud","owner":"FM","status":"Invoiced","months":{"Jan":1013,"Feb":1013,"Mar":1013}},{"id":"ENG-151","client":"Stanford University*","engagement":"Sean Hennessey-Hsieh","owner":"FM","status":"Invoiced","months":{"Jan":1013,"Feb":1013,"Mar":1013}},{"id":"ENG-152","client":"Stanford University*","engagement":"Sandy Yujuico","owner":"FM","status":"Invoiced","months":{"Jan":1013,"Feb":1013,"Mar":1013}},{"id":"ENG-153","client":"Stanford University*","engagement":"Cecilia Arradaza","owner":"FM","status":"Invoiced","months":{"Jan":1013,"Feb":1013,"Mar":1013}},{"id":"ENG-154","client":"Stanford University*","engagement":"Jean Sud","owner":"SD","status":"Invoiced","months":{"Apr":1013,"May":1013,"Jun":1013,"Jul":1013,"Aug":1013,"Sept":1013}},{"id":"ENG-155","client":"Stanford University*","engagement":"Sean Hennessey-Hsieh","owner":"SD","status":"Invoiced","months":{"Apr":1013,"May":1013,"Jun":1013,"Jul":1013,"Aug":1013,"Sept":1013}},{"id":"ENG-156","client":"Stanford University*","engagement":"Sandy Yujuico","owner":"SD","status":"Invoiced","months":{"Apr":1013,"May":1013,"Jun":1013,"Jul":1013,"Aug":1013,"Sept":1013}},{"id":"ENG-157","client":"Stanford University*","engagement":"Cecilia Arradaza","owner":"SD","status":"Invoiced","months":{"Apr":1013,"May":1013,"Jun":1013,"Jul":1013,"Aug":1013,"Sept":1013}},{"id":"ENG-158","client":"Stanford University*","engagement":"Sean Riordan","owner":"SJC","status":"Invoiced","months":{"Apr":1013,"May":1012,"Jun":1012,"Jul":1012,"Aug":1013,"Sept":1013}},{"id":"ENG-159","client":"Stanford University*","engagement":"Jennifer Dingle","owner":"SJC","status":"Invoiced","months":{"Apr":1013,"May":1012,"Jun":1012,"Jul":1012,"Aug":1013,"Sept":1013}},{"id":"ENG-160","client":"Stanford University*","engagement":"Grayson Burdon","owner":"SJC","status":"Invoiced","months":{"Apr":3038,"May":2024,"Jun":2024,"Jul":2024,"Aug":1013,"Sept":1013}},{"id":"ENG-161","client":"Stanford University*","engagement":"Nour Malek","owner":"SJC","status":"Invoiced","months":{"Apr":3038,"May":2024,"Jun":2024,"Jul":2024,"Aug":1013,"Sept":1013}},{"id":"ENG-162","client":"Stanford University*","engagement":"Konstantina Stankovic ","owner":"FM","status":"Invoiced","months":{"Jan":2917,"Feb":2917,"Mar":2917}},{"id":"ENG-163","client":"Stanford University*","engagement":"Konstantina Stankovic ","owner":"SD","status":"Invoiced","months":{"Apr":2917,"May":2917,"Jun":2917,"Jul":2917,"Aug":2917,"Sept":2917,"Oct":2917,"Nov":2917,"Dec":2917}},{"id":"ENG-164","client":"Stanford University*","engagement":"Antonio Omuro","owner":"FM","status":"","months":{"Jan":2500,"Feb":2500,"Mar":2500}},{"id":"ENG-165","client":"Stanford University*","engagement":"Antonio Omuro","owner":"SD","status":"","months":{"Apr":2500,"May":2500,"Jun":2500,"Jul":2500,"Aug":2500,"Sept":2500,"Oct":2500,"Nov":2500,"Dec":2500}},{"id":"ENG-166","client":"Stanford University*","engagement":"Sylvia Plevritis ","owner":"FM","status":"Invoiced","months":{"Jan":2917,"Feb":2917,"Mar":2917}},{"id":"ENG-167","client":"Stanford University*","engagement":"Sylvia Plevritis ","owner":"SD","status":"Invoiced","months":{"Apr":2917,"May":2917,"Jun":2917,"Jul":2917,"Aug":2917,"Sept":2917,"Oct":2917,"Nov":2917,"Dec":2917}},{"id":"ENG-168","client":"Stanford University*","engagement":"Tom Caruso","owner":"SD","status":"","months":{"Jun":5000,"Jul":5000,"Aug":5000,"Sept":5000,"Oct":5000,"Nov":5000}},{"id":"ENG-169","client":"Stanford University*","engagement":"Kristin Schreiber","owner":"SD","status":"","months":{"Jun":5000,"Jul":5000,"Aug":5000,"Sept":5000,"Oct":5000,"Nov":5000}},{"id":"ENG-170","client":"Stanford University*","engagement":"Andra Blomkalns ","owner":"FM","status":"","months":{"Jan":5833,"Feb":5833,"Mar":5000}},{"id":"ENG-171","client":"Stanford University*","engagement":"Andra Blomkalns ","owner":"SD","status":"","months":{"Apr":5000,"May":5000,"Jun":5000,"Jul":5000,"Aug":5000}},{"id":"ENG-172","client":"Stanford University*","engagement":"El Rahimy","owner":"MB","status":"Other","months":{"Apr":5556,"May":5556,"Jun":5556,"Jul":5556,"Aug":17056,"Sept":5556,"Oct":5556,"Nov":5556,"Dec":5556}},{"id":"ENG-173","client":"Teladoc Health","engagement":"1:1 Media Skills Trainings ","owner":"SJC","status":"Invoiced","months":{"Apr":1250}},{"id":"ENG-174","client":"Teladoc Health","engagement":"Keynote - Global Sales Forum","owner":"SJC / JT","status":"Paid","months":{"Jan":12500}},{"id":"ENG-175","client":"Triton International","engagement":"Pitch Skill Development","owner":"SJC","status":"","months":{"May":12500}},{"id":"ENG-176","client":"Willkie","engagement":"Partner Retreat","owner":"JT","status":"","months":{"May":23000}},{"id":"ENG-177","client":"Willkie","engagement":"Partner Retreat","owner":"SJC","status":"","months":{"May":23000}},{"id":"ENG-178","client":"Willkie","engagement":"Partner Retreat","owner":"TC","status":"","months":{"May":23000}},{"id":"ENG-179","client":"Willkie","engagement":"Partner Retreat","owner":"NJ","status":"","months":{"May":11500}},{"id":"ENG-180","client":"Willkie","engagement":"Partner Retreat","owner":"MB","status":"","months":{"May":11500}},{"id":"ENG-181","client":"Willkie","engagement":"Jeff Poss","owner":"SJC","status":"Invoiced","months":{"Feb":1750,"Mar":3500,"Apr":3500,"May":1750}},{"id":"ENG-182","client":"WK Kellogg Co","engagement":"Skill Development","owner":"SJC","status":"","months":{}},{"id":"ENG-183","client":"WorldQuant","engagement":"Igor Tulchinsky","owner":"FM","status":"On Hold","months":{"Jan":750}}]
;
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
const STATUSES = ['Paid','Part Paid','Invoiced','SOW/Pending','On Hold','Other'];
const INK='#1F3864',LINE='#E4E7EE',GO='#15803D',WARN='#B45309',DANGER='#B91C1C',BG='#F6F7F9';
const money = n => n==null||n==='' ? '—' : '$'+Number(n).toLocaleString();

function persist(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(_){}}
function recall(k,fb){try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch(_){return fb;}}


async function callClaude(emailText, apiKey) {
  const rosterBlock = ROSTER.map(r =>
    r.id+'|'+r.client+'|'+r.engagement+'|'+r.owner+'|'+(r.status||'(blank)')
  ).join('\n');
  const sys = 'You read one email and propose a single update to a revenue tracker. Match the email to exactly one engagement from the roster. Client names may differ slightly. Engagements are often a person name. Match on meaning.\n\nReturn ONE json object, no markdown:\n{"relevant":boolean,"matched_id":string|null,"match_confidence":"high"|"medium"|"low","status_change":{"to":string}|null,"amount_change":{"month":string,"amount":number}|null,"reasoning":string,"email_excerpt":string}\n\n"high" only when one row is a clear fit. Never invent an ID. Ambiguous = null + low.';
  const user = 'ROSTER:\n'+rosterBlock+'\n\nEMAIL:\n"""\n'+emailText+'\n"""';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 800, system: sys, messages: [{ role: 'user', content: user }] })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  let txt = (data.content||[]).filter(b => b.type==='text').map(b => b.text).join('');
  txt = txt.replace(/```json|```/g,'').trim();
  const s = txt.indexOf('{'), e = txt.lastIndexOf('}');
  return JSON.parse(txt.slice(s, e+1));
}

function getEmailText() {
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
}

function Badge({ c }) {
  const map = { high:[GO,'#DCFCE7'], medium:[WARN,'#FEF3C7'], low:[DANGER,'#FEE2E2'] };
  const [fg, bg] = map[c] || map.low;
  return React.createElement('span', {
    style: { fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:99, color:fg, background:bg, whiteSpace:'nowrap' }
  }, c+' confidence');
}

function Suggestion({ item, baseline, log, onApply, onDismiss }) {
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
  const changed = mid!==(item.matched_id||'')||statusTo!==(item.statusTo||'')||month!==(item.month||'')||String(amount)!==String(item.amount??'');
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
      candidates.length>0 && e('div', { style:{position:'absolute',zIndex:10,background:'#fff',width:'100%',border:'1px solid '+LINE,borderRadius:6,marginTop:2,boxShadow:'0 4px 12px rgba(0,0,0,0.1)',maxHeight:180,overflowY:'auto'} },
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
}

function LogRow({ e: entry }) {
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
}

function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('suggest');
  const [apiKey, setApiKey] = useState(() => recall('scl_key',''));
  const [showKey, setShowKey] = useState(!recall('scl_key',''));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState(() => recall('scl_webhook',''));
  const [queue, setQueue] = useState(() => recall('scl_queue',[]));
  const [log, setLog] = useState(() => recall('scl_log',[]));
  const [writeStatus, setWriteStatus] = useState({});

  const baseline = useMemo(() => {
    const m = {};
    ROSTER.forEach(r => { m[r.id] = { status:r.status||'', months:{...(r.months||{})} }; });
    return m;
  }, []);

  useEffect(() => { Office.onReady(() => setReady(true)); }, []);
  useEffect(() => { persist('scl_queue', queue); }, [queue]);
  useEffect(() => { persist('scl_log', log); }, [log]);
  useEffect(() => { persist('scl_key', apiKey); }, [apiKey]);
  useEffect(() => { persist('scl_webhook', webhookUrl); }, [webhookUrl]);

  const handleAnalyze = useCallback(async () => {
    if (!apiKey.trim()) { setErr('Enter your Anthropic API key first (⚙ above).'); return; }
    setLoading(true); setErr(null);
    try {
      const emailText = await getEmailText();
      const r = await callClaude(emailText, apiKey);
      if (!r.relevant) { setErr("No tracker update found in this email."); setLoading(false); return; }
      const eng = r.matched_id ? ROSTER.find(x=>x.id===r.matched_id) : null;
      setQueue(prev => [{
        qid: Date.now()+'',
        matched_id:r.matched_id, client:eng?.client||'', engagement:eng?.engagement||'', owner:eng?.owner||'',
        confidence:r.match_confidence||'low', statusTo:r.status_change?.to||'',
        month:r.amount_change?.month||'', amount:r.amount_change?.amount??'',
        reasoning:r.reasoning||'', excerpt:r.email_excerpt||'',
      }, ...prev]);
      setTab('suggest');
    } catch(ex) { setErr(ex.message||'Analysis failed. Check your API key.'); }
    setLoading(false);
  }, [apiKey]);

  async function applyItem(item, edited, wasEdited) {
    const now = new Date();
    const date=now.toISOString().slice(0,10), time=now.toTimeString().slice(0,5);
    const eng = ROSTER.find(x=>x.id===edited.matched_id);
    const logForId = log.filter(e=>e.id===edited.matched_id);
    const curStatus = logForId.filter(e=>e.field==='Status').slice(-1)[0]?.to || baseline[edited.matched_id]?.status||'';
    const curMonth = edited.month ? (logForId.filter(e=>e.field===edited.month).slice(-1)[0]?.to ?? baseline[edited.matched_id]?.months?.[edited.month]??null) : null;
    const entries = [];
    if (edited.statusTo && edited.statusTo!==curStatus)
      entries.push({date,time,id:edited.matched_id,client:eng?.client||'',engagement:eng?.engagement||'',field:'Status',from:curStatus||'(blank)',to:edited.statusTo,confidence:item.confidence,edited:wasEdited});
    if (edited.month && edited.amount!==''&&edited.amount!==null && Number(curMonth)!==Number(edited.amount))
      entries.push({date,time,id:edited.matched_id,client:eng?.client||'',engagement:eng?.engagement||'',field:edited.month,from:curMonth??'(blank)',to:Number(edited.amount),confidence:item.confidence,edited:wasEdited});
    if (!entries.length) { setQueue(prev=>prev.filter(x=>x.qid!==item.qid)); return; }

    // fire Power Automate webhook if configured
    if (webhookUrl.trim()) {
      setWriteStatus(prev=>({...prev,[item.qid]:'writing'}));
      try {
        await Promise.all(entries.map(entry =>
          fetch(webhookUrl, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
              engagement_id: entry.id,
              field: entry.field,          // 'Status' or a month name e.g. 'May'
              value: entry.to,             // new value
              old_value: entry.from,
              client: entry.client,
              engagement: entry.engagement,
              confidence: entry.confidence,
              edited_by_user: entry.edited,
              applied_at: date+'T'+time,
            })
          })
        ));
        setWriteStatus(prev=>({...prev,[item.qid]:'done'}));
      } catch(_) {
        setWriteStatus(prev=>({...prev,[item.qid]:'error'}));
      }
    }

    setLog(prev=>[...entries,...prev]);
    setQueue(prev=>prev.filter(x=>x.qid!==item.qid));
  }

  const e = (tag, props, ...ch) => React.createElement(tag, props, ...ch);
  if (!ready) return e('div',{style:{padding:20,color:'#64748B',fontSize:13}},'Connecting to Outlook…');

  return e('div', { style:{minHeight:'100vh',background:BG} },
    // ── header ──
    e('div', { style:{background:'#fff',borderBottom:'1px solid '+LINE,padding:'10px 12px'} },
      e('div', { style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6} },
        e('div', { style:{fontSize:13,fontWeight:700,color:INK,letterSpacing:'-0.01em'} }, 'SCL Revenue Tracker'),
        e('button', { onClick:()=>setShowKey(v=>!v), style:{fontSize:11,color:'#94A3B8',background:'none',border:'none',cursor:'pointer'} }, '⚙ API key')
      ),
      showKey && e('div', { style:{marginBottom:8} },
        e('div',{style:{fontSize:10,color:'#94A3B8',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}},'Anthropic API key'),
        e('input', {
          value:apiKey, onChange:ev=>setApiKey(ev.target.value),
          type:'password', placeholder:'sk-ant-…',
          style:{width:'100%',border:'1px solid '+LINE,borderRadius:6,padding:'5px 8px',fontSize:12,outline:'none',marginBottom:8,boxSizing:'border-box'}
        }),
        e('div',{style:{fontSize:10,color:'#94A3B8',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}},'Power Automate webhook URL'),
        e('input', {
          value:webhookUrl, onChange:ev=>setWebhookUrl(ev.target.value),
          type:'text', placeholder:'https://prod-xx.westus.logic.azure.com/…',
          style:{width:'100%',border:'1px solid '+(webhookUrl?'#BBF7D0':LINE),borderRadius:6,padding:'5px 8px',fontSize:11,outline:'none',boxSizing:'border-box'}
        }),
        e('div',{style:{fontSize:10,color:'#94A3B8',marginTop:3}}, webhookUrl ? '✓ Excel will update automatically on Apply' : 'Leave blank to log only — add later to write to Excel')
      ),
      e('button', {
        onClick:handleAnalyze, disabled:loading||!ready,
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

    // ── body ──
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
                  const h='Date,Time,ID,Client,Engagement,Field,From,To,Confidence,Edited';
                  const esc=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
                  const rows=[...log].reverse().map(entry=>[entry.date,entry.time,entry.id,entry.client,entry.engagement,entry.field,entry.from,entry.to,entry.confidence,entry.edited?'yes':'no'].map(esc).join(','));
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
}

Office.onReady(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
});
