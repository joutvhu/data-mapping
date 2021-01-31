const fs = require('fs');
const {compiler, beautify} = require('flowgen');

if (fs.existsSync('./dist/flow/'))
    fs.rmdirSync('./dist/flow/');
fs.mkdirSync('./dist/flow/');
fs.readdirSync('./src/').forEach(file => {
    if (file.endsWith('.ts')) {
        const flowdef = compiler.compileDefinitionFile('./src/' + file, {
            jsdoc: true,
            interfaceRecords: true,
            moduleExports: true
        });
        const readableDef = beautify(flowdef);
        fs.writeFileSync('./dist/flow/' + file.replace('.ts', '.flow.js'), readableDef);
    }
});
