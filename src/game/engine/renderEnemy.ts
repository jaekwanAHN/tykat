import type { Stage } from "../data/stages";

// Distinct silhouettes built with Canvas geometry. Origin is the enemy's torso.
export function renderEnemy(ctx: CanvasRenderingContext2D, enemy: Readonly<Stage>, warning: boolean) {
  const color = warning ? "#e98687" : enemy.color;
  const polygon = (points: number[][], fill = color) => {
    ctx.fillStyle = fill; ctx.beginPath();
    points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)); ctx.closePath(); ctx.fill();
  };
  const ellipse = (x: number, y: number, rx: number, ry: number, fill = color) => {
    ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  };
  const line = (points: number[][], width = 7, stroke = color) => {
    ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath();
    points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)); ctx.stroke();
  };
  const eyes = (y: number, spread = 20) => {
    ellipse(-spread, y, 7, 4, "#fff1b9"); ellipse(spread, y, 7, 4, "#fff1b9");
  };
  ellipse(0, 99, 95, 15, "#080a10");
  switch (enemy.shape) {
    case "ogre":
      polygon([[-65,-40],[65,-40],[75,65],[40,95],[15,95],[15,70],[-15,70],[-15,95],[-40,95],[-75,65]]);
      ellipse(0,-48,48,48); eyes(-50);
      polygon([[-40,-65],[-55,-115],[-20,-85]],"#c9b9b7"); polygon([[40,-65],[55,-115],[20,-85]],"#c9b9b7");
      line([[-65,-10],[-80,60]],25); line([[65,-10],[80,60]],25); break;
    case "wolf":
      polygon([[-80,20],[-60,-30],[10,-45],[65,-20],[85,30],[40,60],[-45,55]]);
      polygon([[-50,-35],[-60,-100],[-20,-70],[20,-70],[60,-100],[50,-35],[0,0]],"#d8a1ae");
      eyes(-50); polygon([[-15,-30],[15,-30],[0,-12]],"#302537");
      line([[-45,45],[-60,90]],16); line([[45,45],[60,90]],16);
      polygon([[70,20],[115,-10],[100,50],[65,60]]); break;
    case "spider":
      for (const side of [-1,1]) for (let i=0;i<4;i++) line([[side*35, i*17-30],[side*(100+i*8),i*30-70],[side*(130-i*9),i*22+5]],8);
      ellipse(0,15,52,65); ellipse(0,-40,35,30,"#426b40");
      ellipse(0,-40,18,16,"#d4ff9c"); ellipse(0,-40,6,12,"#102b20");
      polygon([[-16,-15],[-25,15],[-5,0]],"#e5f3bf"); polygon([[16,-15],[25,15],[5,0]],"#e5f3bf"); break;
    case "golem":
      polygon([[-70,-35],[-35,-65],[40,-65],[75,-30],[65,60],[-60,60]]);
      polygon([[-35,-70],[-28,-100],[30,-100],[38,-70],[25,-40],[-25,-40]],"#a6c5d2"); eyes(-70,14);
      for (const side of [-1,1]) { polygon([[side*65,-30],[side*100,-15],[side*108,60],[side*72,65]]); line([[side*35,55],[side*40,95]],30); }
      polygon([[0,-15],[20,10],[0,35],[-20,10]],"#bafaff"); break;
    case "wraith":
      polygon([[0,-105],[-50,-55],[-60,20],[-85,95],[-40,70],[-15,95],[10,65],[45,90],[80,65],[55,5],[45,-60]]);
      ellipse(0,-45,30,38,"#183743"); eyes(-47,13);
      line([[-45,0],[-100,20],[-125,-10]],9); line([[45,0],[100,20],[125,-10]],9); break;
    case "knight":
      polygon([[-45,-35],[45,-35],[55,50],[0,80],[-55,50]]);
      polygon([[-30,-80],[0,-105],[30,-80],[28,-40],[-28,-40]],"#d2cce4");
      line([[-18,-63],[18,-63]],6,"#443c64");
      polygon([[-50,-35],[-80,-70],[-80,-15],[-48,10]]); polygon([[50,-35],[80,-70],[80,-15],[48,10]]);
      line([[70,70],[100,-75]],7,"#f1d3f5"); line([[70,30],[105,43]],6);
      polygon([[-60,-5],[-105,0],[-98,55],[-65,70],[-45,45]],"#655a85");
      line([[-23,65],[-28,95]],18); line([[23,65],[28,95]],18); break;
    case "serpent":
      line([[45,90],[-60,80],[-55,40],[50,30],[50,-10],[-20,-25],[-20,-70]],35);
      polygon([[-20,-100],[-65,-65],[-40,-20],[0,-20],[25,-65]],"#a1dbaf"); eyes(-65,16);
      line([[-20,-40],[-20,-15],[-30,-5]],3,"#ff8993");
      line([[-20,-15],[-10,-5]],3,"#ff8993"); break;
    case "phoenix":
      for(const side of [-1,1]) polygon([[0,-10],[side*70,-55],[side*150,-105],[side*125,-20],[side*65,30],[side*105,55],[side*20,45]]);
      polygon([[0,-70],[-30,10],[-15,50],[-40,100],[0,75],[35,100],[15,45],[30,10]],"#f9cc79");
      polygon([[0,-80],[25,-50],[0,-35],[-15,-50]],"#fff0b5");
      polygon([[18,-55],[45,-45],[15,-40]],"#df6948"); ellipse(7,-56,4,4,"#522234"); break;
    case "dragon":
      for(const side of [-1,1]) polygon([[side*25,0],[side*75,-90],[side*155,-45],[side*115,-20],[side*90,20],[side*50,40]],"#4f7cbd");
      ellipse(0,20,45,65); polygon([[-35,-70],[-55,-110],[-10,-85],[10,-85],[55,-110],[35,-70],[30,-20],[-30,-20]],"#c2e8ff"); eyes(-56);
      for(const side of [-1,1]) line([[side*30,65],[side*65,90]],17);
      line([[20,65],[75,70],[95,40]],12); break;
    case "sovereign":
      ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0,0,105,105,0,0,Math.PI*2); ctx.stroke();
      for(let i=0;i<6;i++) { const angle=i*Math.PI/3; const x=Math.cos(angle)*115,y=Math.sin(angle)*100; polygon([[x,y-10],[x+7,y],[x,y+10],[x-7,y]],"#e1b5ff"); }
      polygon([[0,-70],[-48,-25],[-65,90],[0,60],[65,90],[48,-25]],"#70539b");
      polygon([[-30,-65],[-45,-105],[-15,-85],[0,-120],[15,-85],[45,-105],[30,-65]],"#e5b5ff");
      ellipse(0,-35,27,33,"#221634"); ellipse(0,-36,16,7,"#fff2c3");
      polygon([[0,0],[25,30],[0,55],[-25,30]],"#cf90f5");
      break;
  }
}
