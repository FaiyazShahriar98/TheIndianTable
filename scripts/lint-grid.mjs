// Design-system guard: 8pt spacing, role-based colour, scale-only type. Run: npm run lint:grid
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(p) ? [p] : [] })
const rules = [
  [/(?<![\w-])-?(?:m|p|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|gap-x|gap-y|gap|space-x|space-y|top|left|right|bottom|inset-x|inset-y|inset|h|w|size|min-h|min-w)-(?:0\.5|1\.5|2\.5|3\.5|1|3|5|7|9|11)(?![\w.])/g, 'off-grid spacing (use 2, 4, 6, 8, 12, 16, 24...)', m => /^-?m?px-5$|^-?mx-5$|^h-0\.5$/.test(m)],
  [/(?<![\w-])-?(?:m|p|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|gap|h|w|min-h|top|left|right|bottom)-\[\d+px\]/g, 'arbitrary px value', m => { const n = +m.match(/\[(\d+)px\]/)[1]; return n % 8 === 0 || n === 9999 }],
  [/#[0-9a-fA-F]{3,8}\b(?![^<]*<\/)/g, 'raw hex colour (use a role token)', (m, line) => /(&#\d+|href="#|id="#|icons?)/.test(line)],
  [/(?<![\w-])(?:bg|text|border|ring|outline|fill|stroke)-(?:red|green|blue|yellow|gray|slate|zinc|neutral|emerald|cream|brass|charcoal)(?:-\d+)?\b/g, 'colour outside the role tokens', () => false],
  [/text-\[\d+px\]/g, 'type outside the scale (use text-micro..text-hero)', () => false],
]
let bad = 0
for (const f of walk('src')) {
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    for (const [re, msg, ok] of rules) for (const m of line.matchAll(re)) if (!ok(m[0], line)) { bad++; console.log(`${f}:${i + 1}  ${m[0]}  ->  ${msg}`) }
  })
}
console.log(bad ? `\n${bad} issue(s)` : 'Design grid clean.')
process.exit(bad ? 1 : 0)
