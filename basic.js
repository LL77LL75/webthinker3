function setup(){
    new Canvas (800,400);
    textSize(16);
    fill(0);
    console.log("hallo");
    let x = 1;
    const y = 2;
    let area = 1/2 * x * y
    text(area, x , y)
}