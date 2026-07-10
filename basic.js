function setup(){
    new Canvas (800,400);
    background("yellow")
    textSize(16);
    fill(0);
    console.log("hallo");
    let x = 1;
    const y = 2;
    let area = 1/2 * x * y
    console.log("area:",area);
    text(area, x , y);
    let sum = 0;
    for( let i = 2; i <= 20; i+=2){
        console.log(i);
        sum += i;
    }
    console.log(sum)
    if (sum >= 10){
        console.log("good")
    } else if (sum >= 5){
        console.log("bad")
    }
    let list = []
    list.push("hi")
    console.log(list)
    list.shift();
    
} 