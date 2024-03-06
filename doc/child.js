const calculationLong = function(){
    let initial = 0;
    for(let i = 0; i < 1e9; i++){
        initial += i;
    };
    return initial
}
process.on('message', function(message){
    if(message === 'start'){
        const sum = calculationLong();
        process.send(sum);
    };
});