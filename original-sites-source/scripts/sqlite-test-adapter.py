import json,sqlite3,sys
from pathlib import Path
request=json.load(sys.stdin)
c=sqlite3.connect('.sites-runtime/advanced-test.sqlite');c.row_factory=sqlite3.Row
if request.get('initialize'):
 for p in sorted(Path('drizzle').glob('*.sql')):c.executescript(p.read_text().replace('--> statement-breakpoint',''))
 c.commit();print('{}')
else:
 cursor=c.execute(request['sql'],request.get('args',[]));rows=[dict(row) for row in cursor.fetchall()] if cursor.description else []
 c.commit();print(json.dumps({'rows':rows,'changes':max(cursor.rowcount,0)}))
