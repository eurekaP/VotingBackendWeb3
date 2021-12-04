function add(a,b){
    return a+b;
}
module.exports.moduletest=(a,b)=>new Promise((resolve, reject)=>{
    let val=add(a,b);
    if(val>0)
        resolve(val);
})
