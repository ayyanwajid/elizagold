const fs = require('fs');
const path = 'src/app/admin/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetImport = 'import Link from "next/link";';
const newImport = 'import Link from "next/link";\nimport { motion, AnimatePresence } from "framer-motion";';

if (content.includes(targetImport) && !content.includes('framer-motion')) {
    content = content.replace(targetImport, newImport);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully injected framer-motion imports');
} else {
    console.log('Imports already exist or could not find target');
}
