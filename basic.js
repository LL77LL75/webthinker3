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
    for( let i = 0; i < 10*10; i+=2){
        console.log(i)
    }
}