const collectData = {
  collectList:[],
  setCollectListData:function(val){
    this.collectList.push(val)
  },
  resetCollectListData:function(){
    this.collectList = []
  },
  getCollectListData:function(){
    return this.collectList
  }
}
const checkFileHead = function(node){
  let val = ''
    collectData.resetCollectListData()
    if(node.body&&node.body.length>0){
        let leadingComments = node.body[0].leadingComments?node.body[0].leadingComments:''
        if(leadingComments && leadingComments.length>0){
            val = leadingComments[0].value
        }
    }
    if(val.trim() == 'disableCheckChinese' || val.trim() === 'disableTranslate'){
        return false
    }
    return true
}
const _stringIncludeChinese = function(value){
  
  return /.*[\u4e00-\u9fa5]+.*$/.test(value)
}
const collectChinese = function(node){
  const includeTypeList = ['TemplateElement','StringLiteral','JSXText']
  if(includeTypeList.includes(node.type)){
    let val = ''
    if(node.type == 'JSXText' || node.type == 'StringLiteral'){
      val = node.value
    }else {
      val = node.value.cooked
    }
    val = val.replace(/[\r\n]/g,'').trim()
    if(_stringIncludeChinese(val)){
        collectData.setCollectListData(val)
    }
}
}
module.exports = {
  collectData,
  checkFileHead,
  collectChinese
}