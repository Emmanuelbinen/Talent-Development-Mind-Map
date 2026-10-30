// Data: string = leaf, [label, [children]] = branch
var TD = ["Talent Development / Talent Management",[
 ["Individualist Approach",["Training and Development","Employees","Organizational Performance"]],
 ["Systems Approach",["Training","Organizational Goals","Organizational Capacity","Organizational Culture","Leadership","Job Design","Processes","Systems","Structures","Performance Management"]],
 ["Modern Approach",["Employee Development","Supportive Environment",["Multifaceted Approach",["Output","Workforce","Shortages"]]]],
 "Work-Life Balance","Professional Development","Organizational Culture","Alignment","Sustainable","Effectiveness","Retention Strategies",
 ["Multigenerational",["Gen-Z","Millennials","Baby Boomer","Gen-X"]],
 "Workplaces",
 ["Talent Management",["Flexibility","Support","Performance","Business Strategies","Expectations"]]]];
var SR = ["Staff Retention",[
 ["Work Environment",["Career Development","Training","Organizations","Talent","Talent Development","Upskilling","Tools","Productivity","Organizational Performance"]],
 ["Retention Strategies",["Work-Life Balance","Salaries","Consequences","People Management","Purpose","Goals","Decision-Making","Human Capital"]]]];
var KM = ["Knowledge Management",[
 "Knowledge","Preparedness","Human Resources","Research","Performance Management","Impact","Professionals","Systems","Structure","Processes","Goals","Database","Objectives",
 ["Industries",["Integration","Healthcare Systems","Tech Providers","Healthcare Providers","Innovation"]]]];

function mk(d,color){
  var n={label:typeof d==="string"?d:d[0],color:color,kids:[],open:true};
  if(typeof d!=="string") n.kids=d[1].map(function(k){return mk(k,color)});
  return n;
}
var right=[mk(TD,"var(--c1)")];
var left=[mk(SR,"var(--c2)"),mk(KM,"var(--c3)")];
var zoom=1, RH=24, PAD=30, COLGAP=34;
var ctx=document.createElement("canvas").getContext("2d");
function tw(n,d){ctx.font=(d===1?"600 15px ":"12.5px ")+"Segoe UI, Arial, sans-serif";return Math.ceil(ctx.measureText(n.label).width)+14+(n.kids.length?18:0)}
function walk(n,f){f(n);n.kids.forEach(function(k){walk(k,f)})}
function setAll(v){[].concat(left,right).forEach(function(b){walk(b,function(n){if(n.kids.length)n.open=v});b.open=true})}

function layoutSide(list){
  var cur=0, widths=[];
  function lay(n,d){
    n.d=d; n.w=tw(n,d); widths[d]=Math.max(widths[d]||0,n.w);
    if(!n.kids.length||!n.open){n.y=cur;cur+=RH;return}
    n.kids.forEach(function(k){lay(k,d+1)});
    n.y=(n.kids[0].y+n.kids[n.kids.length-1].y)/2;
  }
  list.forEach(function(b){lay(b,1);cur+=RH*0.8});
  return {h:Math.max(cur-RH*0.8,RH),widths:widths};
}

function render(){
  var L=layoutSide(left), R=layoutSide(right);
  var H=Math.max(L.h,R.h)+PAD*2, rootW=250, rootH=62;
  function xs(w,dir){var a=[0],x=rootW/2+COLGAP+10;for(var d=1;d<w.length;d++){a[d]=x;x+=w[d]+COLGAP}return {a:a,end:x}}
  var XL=xs(L.widths), XR=xs(R.widths);
  var W=XL.end+XR.end+PAD*2, cx=XL.end+PAD, cy=H/2;
  var out=[], oy;
  function side(list,X,dir,off){
    function draw(n,px,py){
      var start=dir*X.a[n.d], x0=cx+start, lx=dir>0?x0:x0-n.w, y=off+n.y+PAD, ly=y+9;
      var sx=dir>0?x0:x0, ex=dir>0?x0+n.w:x0-n.w;
      out.push('<path d="M'+px+' '+py+' C'+(px+(sx-px)/2)+' '+py+' '+(px+(sx-px)/2)+' '+ly+' '+sx+' '+ly+'" fill="none" stroke="'+n.color+'" stroke-width="'+(n.d===1?3.5:2)+'" stroke-linecap="round"/>');
      out.push('<line x1="'+sx+'" y1="'+ly+'" x2="'+ex+'" y2="'+ly+'" stroke="'+n.color+'" stroke-width="'+(n.d===1?3.5:2)+'" stroke-linecap="round"/>');
      var has=n.kids.length>0, tx=dir>0?sx+4:sx-4;
      out.push('<g class="node'+(has?' has':'')+(n.d===1?' main':'')+'" data-id="'+n.id+'"><rect x="'+Math.min(sx,ex)+'" y="'+(y-10)+'" width="'+n.w+'" height="22" fill="transparent"/><text x="'+tx+'" y="'+(y+4)+'" text-anchor="'+(dir>0?'start':'end')+'">'+n.label.replace(/&/g,"&amp;")+'</text>');
      if(has){
        var dx=ex+dir*(-9);
        out.push('<circle class="dot" cx="'+dx+'" cy="'+(y-3)+'" r="0"/>');
      }
      out.push('</g>');
      if(has){
        var bx=ex+dir*10;
        out.push('<g class="node has" data-id="'+n.id+'"><circle class="dot" cx="'+bx+'" cy="'+ly+'" r="8" stroke="'+n.color+'"/><text class="cnt" x="'+bx+'" y="'+(ly+3.5)+'" text-anchor="middle">'+(n.open?'\u2212':n.kids.length)+'</text></g>');
      }
      if(n.open){var nx=has?ex+dir*18:ex;n.kids.forEach(function(k){draw(k,nx,ly)})}
    }
    list.forEach(function(b){draw(b,cx,cy+0)});
  }
  var id=0;[].concat(left,right).forEach(function(b){walk(b,function(n){n.id=id++})});
  side(left,XL,-1,(H-PAD*2-L.h)/2);
  side(right,XR,1,(H-PAD*2-R.h)/2);
  out.push('<g class="root"><rect x="'+(cx-rootW/2)+'" y="'+(cy-rootH/2)+'" width="'+rootW+'" height="'+rootH+'" rx="10"/><text x="'+cx+'" y="'+(cy-6)+'">Leadership Development /</text><text x="'+cx+'" y="'+(cy+12)+'">Talent Development</text><text class="sub" x="'+cx+'" y="'+(cy+28)+'">Domain Inquiry</text></g>');
  var s=document.getElementById("svg");
  s.setAttribute("viewBox","0 0 "+W+" "+H);
  s.setAttribute("width",W*zoom); s.setAttribute("height",H*zoom);
  s.innerHTML=out.join("");
  s.dataset.cx=cx; s.dataset.cy=cy;
}
function center(){
  var w=document.getElementById("wrap"),s=document.getElementById("svg");
  w.scrollLeft=s.dataset.cx*zoom-w.clientWidth/2;
  w.scrollTop=s.dataset.cy*zoom-w.clientHeight/2;
}
document.getElementById("svg").addEventListener("click",function(e){
  var g=e.target.closest(".node.has"); if(!g)return;
  var id=+g.dataset.id;
  [].concat(left,right).forEach(function(b){walk(b,function(n){if(n.id===id)n.open=!n.open})});
  var w=document.getElementById("wrap"),sl=w.scrollLeft,st=w.scrollTop;
  render(); w.scrollLeft=sl; w.scrollTop=st;
});
document.getElementById("zin").onclick=function(){zoom=Math.min(2,zoom+0.15);render();center()};
document.getElementById("zout").onclick=function(){zoom=Math.max(0.35,zoom-0.15);render();center()};
document.getElementById("exp").onclick=function(){setAll(true);render();center()};
document.getElementById("col").onclick=function(){setAll(false);render();center()};
// drag to pan
(function(){var w=document.getElementById("wrap"),d=false,x,y,sl,st;
 w.addEventListener("pointerdown",function(e){if(e.target.closest(".node.has"))return;d=true;x=e.clientX;y=e.clientY;sl=w.scrollLeft;st=w.scrollTop});
 window.addEventListener("pointermove",function(e){if(!d)return;w.scrollLeft=sl-(e.clientX-x);w.scrollTop=st-(e.clientY-y)});
 window.addEventListener("pointerup",function(){d=false});})();
render(); center();