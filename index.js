#!/usr/bin/env node

/**
 * @fileoverview Main CLI that is run via the eslint command.
 * @author Nicholas C. Zakas
 */

/* eslint no-console:off */

"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const useStdIn = (process.argv.indexOf("--stdin") > -1),
    init = (process.argv.indexOf("--init") > -1),
    debug = (process.argv.indexOf("--debug") > -1);

// must do this initialization *before* other requires in order to work
if (debug) {
    require("debug").enable("eslint:*,-eslint:code-path");
}

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// now we can safely include the other modules that use debug
const path = require("path"),
    fs = require("fs");

//------------------------------------------------------------------------------
// Execution
//------------------------------------------------------------------------------

const babel = require('@babel/core')
const options = require('./bin/options')
const filePath = options.parse(process.argv)._
const rootPath = process.cwd()
const traverse = require('@babel/traverse').default
const parser = require('@babel/parser')
const preCommitVisitor =require('./visitor/index')
const {collectData} = require('./utils/index')
const collectObj = {}
let exclude = ['i18n','language']
// try catch
try {
  const options = require(`${rootPath}/.clint.js`)
  exclude = options.excludeDir||exclude
} catch (error) {
  
}
console.log(exclude)


const excludeFile = function(filePath){
  const len = exclude.length
  let fileExtname = path.extname(filePath)
  for(var i = 0 ; i <len ;i++){
    if(filePath.includes(exclude[i]) &&(fileExtname =='.js'||fileExtname=='.jsx')){
      return false 
    }
  }
  return true
}

// code babel ast
const babelFunction = function(code){
  const ast =  parser.parse(code,{
    sourceType:'module',

    plugins:['jsx','flow','decorators-legacy','classProperties','optionalChaining','dynamicImport']
})
  traverse(ast,preCommitVisitor())
}
// read file 
const fsReadFileSync = function (path){
  try {
    const strData = fs.readFileSync(path,'utf-8')
    const code = String(strData)
    babelFunction(code)
    const data = collectData.getCollectListData()
    if(data.length>0){
      collectObj[path] = data
    }
  } catch (error) {
    console.log('error',error)
  }
}
// mapfile
const mapFile = function(filePath){
  
  filePath.forEach(ele=>{
    const bool = excludeFile(ele)
    if(bool){
      fsReadFileSync(ele)
    }
  })
}


//
const outputFunction = function(){
  mapFile(filePath)
  if(Object.keys(collectObj).length>0){
    console.log('some page has chinese please fix it：',JSON.stringify(collectObj))
    process.exit(1)
  }
}
process.once("uncaughtException", err => {

  // lazy load
  const lodash = require("lodash");

  if (typeof err.messageTemplate === "string" && err.messageTemplate.length > 0) {
      const template = lodash.template(fs.readFileSync(path.resolve(__dirname, `../messages/${err.messageTemplate}.txt`), "utf-8"));
      const pkg = require("../package.json");

      console.error("\nOops! Something went wrong! :(");
      console.error(`\nESLint: ${pkg.version}.\n${template(err.messageData || {})}`);
  } else {

      console.error(err.stack);
  }

  process.exitCode = 2;
});

if (useStdIn) {

  /*
   * Note: `process.stdin.fd` is not used here due to https://github.com/nodejs/node/issues/7439.
   * Accessing the `process.stdin` property seems to modify the behavior of file descriptor 0, resulting
   * in an error when stdin is piped in asynchronously.
   */
  const STDIN_FILE_DESCRIPTOR = 0;

  process.exitCode = cli.execute(process.argv, fs.readFileSync(STDIN_FILE_DESCRIPTOR, "utf8"));
} else if (init) {
  const configInit = require("../lib/config/config-initializer");

  configInit.initializeConfig().then(() => {
      process.exitCode = 0;
  }).catch(err => {
      process.exitCode = 1;
      console.error(err.message);
      console.error(err.stack);
  });
} else {
  // process.exitCode = cli.execute(process.argv);

  outputFunction()
}