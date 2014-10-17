KPivotViewer.Views.Utils.getPos = function(el){
  for (var lx=0, ly=0;
       el != null;
       lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {x: lx,y: ly};
}

KPivotViewer.Views.Utils.calculate_item_per_row = function(total, width, height){
  r = Math.floor(width/Math.floor(Math.sqrt((width * height)/total)));
  return (r <= 0)? 1 : r ;
}

KPivotViewer.Views.Utils.calculate_item_width = function(total, width, height){
  w = Math.floor(Math.sqrt((width * height)/total));
  l = KPivotViewer.Views.Utils.calculate_item_per_row(total, width, height);
  while(w*l > width) {
    w--;
  }
  l = Math.round(total / l) +1 ;
  while(w*l > height) {
    w--;
  }
  return w;
}

KPivotViewer.Views.calculate_position = function(index, item_per_row, item_size){
  return [(index % item_per_row) * item_size , Math.floor(index / item_per_row) * item_size]; // left, top
}

KPivotViewer.Views.y3_calculation = function(num_rows,item_size,padding_bottom){
  y1 = KPivotViewer.Views.stage_height - padding_bottom;
  y3 = Math.round(y1/KPivotViewer.Views.scale);
  if(num_rows*item_size > y3){ y3=num_rows*item_size; }
  return y3;
}