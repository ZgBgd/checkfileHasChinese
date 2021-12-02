//visitor 
const {checkFileHead,collectChinese,collectData} = require('../utils/index')
let fileHeadStatus = false
const preCommitVisitor = function (){
  return {
      enter(path, state) {
          const {node} = path
          if(node.type ==='Program'){
            fileHeadStatus = checkFileHead(node)
          }
          if(fileHeadStatus){
            collectChinese(node)
          }
          
          
          
      },
      exit(path){
          const {node} = path
          if(node.type == 'Program'){
          }
      }
  }
}
module.exports = preCommitVisitor