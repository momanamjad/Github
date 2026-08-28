const fs = require('fs');
let content = fs.readFileSync('src/components/features/RepoDetails.jsx', 'utf8');
content = content.replace(/src=\{c\.author\?\.avatar_url \|\| \\\
\/profile\.webp\\\\}/g, 'src={c.author?.avatar_url || generateIdenticon(c.author?.login || \\\default\\\)}');
content = content.replace(/src=\{rev\.reviewer\?\.avatar_url \|\| \\\\/profile\.webp\\\\}/g, 'src={rev.reviewer?.avatar_url || generateIdenticon(rev.reviewer?.login || \\\default\\\)}');
content = content.replace(/src=\{lc\.author\?\.avatar_url \|\| \\\\/profile\.webp\\\\}/g, 'src={lc.author?.avatar_url || generateIdenticon(lc.author?.login || \\\default\\\)}');
fs.writeFileSync('src/components/features/RepoDetails.jsx', content);
