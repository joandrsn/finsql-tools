const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: fs.createReadStream('.file.test')
});

rl.on('line', (line) => {
  console.log(`Line from file ${line}`);
})

function checkfileContent(filename: string, lines: string[]) {
  //Create a set of the filecontent, compare against the lines that I have.
}

function runCheck() {
  //https://github.com/codemix/gitignore-parser
  const gitattributelines = ['* text=auto', '*.txt text eol=crlf', '*.fob binary'];
  const gitignorelines = ['temp', 'lastimportgithash'];
  let missinggitattributeslines = checkfileContent('.gitattributes', gitattributelines);
  let missinggitignorelines = checkfileContent('.gitignore', gitignorelines)
  return 
}