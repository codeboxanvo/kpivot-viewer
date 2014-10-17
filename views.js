KPivotViewer.Views = {};
KPivotViewer.Views.filters = [];
KPivotViewer.Views.Utils = {};
KPivotViewer.Views.detail_panel = {};
KPivotViewer.Views.default_avatar = '/images/default_avatar.png';
KPivotViewer.Views.total_fields = '.total-candidates';
KPivotViewer.Views.current_sort_by_facet = 0;
KPivotViewer.Views.max_column = 5;
KPivotViewer.Views.column_labels = [];
KPivotViewer.Views.column_backgrounds = [];

KPivotViewer.Views.init = function(canvasId, width, height, detailId) {
  KPivotViewer.Views.scale = 1;
  KPivotViewer.Views.stage = null;
  KPivotViewer.Views.stage_width = width;
  KPivotViewer.Views.stage_height = height;
  KPivotViewer.Views.layer = null; // For candidates 
  KPivotViewer.Views.layer2 = null; // For highlight 
  KPivotViewer.Views.layer3 = null; // For column view
  KPivotViewer.Views.view_mode = "grid"; // grid OR column
  KPivotViewer.Views.min_scale = 0.01;
  KPivotViewer.Views.max_scale = 3.0;
  KPivotViewer.Views.canvasId = canvasId;

  KPivotViewer.Views.detail_panel.id = detailId;

  KPivotViewer.Views.stage = new Kinetic.Stage({
      container: KPivotViewer.Views.canvasId,
      width: KPivotViewer.Views.stage_width,
      height: KPivotViewer.Views.stage_height,
      draggable:true
    });

  KPivotViewer.Views.layer = new Kinetic.Layer();
  KPivotViewer.Views.layer2 = new Kinetic.Layer();
  KPivotViewer.Views.layer3 = new Kinetic.Layer();
/*  LAB  */
var label = new Kinetic.Label({
  x: 100,
  y: KPivotViewer.Views.stage_height - 50
});
// add a tag to the label
label.add(new Kinetic.Tag({
  fill: '#ffffff',
  stroke: '#000000',
  lineJoin: 'round',
  cornerRadius: 20
}));
// add text to the label
label.add(new Kinetic.Text({
  text: 'From X to Y',
  fontSize: 20,
  lineHeight: 1.2,
  fill: 'black',
  align: 'center',
  padding: 5
 }));
base_column_background = new Kinetic.Rect({
    x: 10,
    y: 10,
    width: 90,
    height: 90,
    fill: '#ddd',
    stroke: '#ddd',
    strokeWidth: 0
  });
label.on('click', function(){
  // Do some filtering
  KPivotViewer.Views.filters[KPivotViewer.Views.current_sort_by_facet].update_to(this.column_data);
});
label.on('mouseover', function(){
  // Do some filtering
  document.body.style.cursor = 'pointer';
});
label.on('mouseout', function(){
  // Do some filtering
  document.body.style.cursor = 'default';
});

for (var i = 0; i < KPivotViewer.Views.max_column; i++) {
  KPivotViewer.Views.column_labels[i] = label.clone();
  KPivotViewer.Views.layer3.add(KPivotViewer.Views.column_labels[i]);

  KPivotViewer.Views.column_backgrounds[i] = base_column_background.clone();
  if(i%2 == 1){
    KPivotViewer.Views.column_backgrounds[i].setFill('#ddd');
    KPivotViewer.Views.column_backgrounds[i].setStroke('#ddd');
  }else{
    KPivotViewer.Views.column_backgrounds[i].setFill('#ccc');
    KPivotViewer.Views.column_backgrounds[i].setStroke('#ccc');
  }
  KPivotViewer.Views.layer3.add(KPivotViewer.Views.column_backgrounds[i]);
};

  KPivotViewer.Views.highlight = new Kinetic.Rect({
    x: 10,
    y: 10,
    width: 90,
    height: 90,
    stroke: 'lightsteelblue',
    strokeWidth: 8
  });

  KPivotViewer.Views.layer2.add(KPivotViewer.Views.highlight);
  KPivotViewer.Views.candidate_images = [];

  var baseImageObj = new Image();
  baseImageObj.avatar = KPivotViewer.Views.default_avatar
  baseImageObj.src = KPivotViewer.Views.default_avatar

  var baseImage = new Kinetic.Image({
      x: 0,
      y: 0,
      width: 90,
      height: 90
    });
  baseImage.on('mouseover', function() {
    var pos = this.getPosition();
    KPivotViewer.Views.highlight.show().setPosition(pos.x,pos.y);
    KPivotViewer.Views.layer2.draw();
  });
  baseImage.on('click', function() {
    KPivotViewer.Views.focus_to(this);
  });
  for (var i = 0; i < KPivotViewer.Models.source.length; i++) {
    var imageObj = baseImageObj.cloneNode(true);
    imageObj.avatar = KPivotViewer.Models.source[i].avatar
    var image = baseImage.clone({
      image: imageObj
    });
    image.candidate_id = KPivotViewer.Models.source[i].id;
    image.image_index = i;

    KPivotViewer.Views.candidate_images.push(image);
    KPivotViewer.Views.layer.add(image);
  };

  KPivotViewer.Views.layer3.hide();
  KPivotViewer.Views.stage.add(KPivotViewer.Views.layer3);

  KPivotViewer.Views.stage.add(KPivotViewer.Views.layer2);
  KPivotViewer.Views.stage.add(KPivotViewer.Views.layer);

  KPivotViewer.Views.draw_candidates();
  KPivotViewer.Views.min_scale = KPivotViewer.Views.scale;

  // add event listener //
  $('#graph').bind('mousewheel MozMousePixelScroll', function(event, delta, deltaX, deltaY){
    event.preventDefault();
    KPivotViewer.Views.onMouseWheel(event,delta,deltaX,deltaY);
  });

  KPivotViewer.Views.preload_avatar();
}

KPivotViewer.Views.preload_avatar = function(){
  var queue = new createjs.LoadQueue();
  queue.on("fileload", KPivotViewer.Views.handleAvatarLoad, this);
  for (var i = KPivotViewer.Views.candidate_images.length - 1; i >= 0; i--) {
    queue.loadFile({id:i, src:KPivotViewer.Models.source[i].avatar});
  }
}
KPivotViewer.Views.handleAvatarLoad = function(event){
  KPivotViewer.Views.candidate_images[event.item.id].getImage().src = event.item.src
  if(event.item.id % 10 == 0){
    KPivotViewer.Views.layer.draw();
  }
}
KPivotViewer.Views.onMouseWheel = function(e, delta,dx,dy) {
  KPivotViewer.Views.detail_panel.hide();
  // mozilla fix...
  if (e.originalEvent.detail){
    delta = e.originalEvent.detail;
  }
  else{
    delta = e.originalEvent.wheelDelta;
  }

  if (delta !== 0) {
    e.preventDefault();
  }

  var cur_scale;
  if (delta > 0) {
    cur_scale = KPivotViewer.Views.scale + Math.abs(delta / 640);
  } else {
    cur_scale = KPivotViewer.Views.scale - Math.abs(delta / 640);
  }

  if (cur_scale > KPivotViewer.Views.min_scale && cur_scale < KPivotViewer.Views.max_scale) {
    KPivotViewer.Views.zoom_to(e,cur_scale)
  }
}
KPivotViewer.Views.zoom_to = function(e,cur_scale){
  var cnvsPos=KPivotViewer.Views.Utils.getPos(document.getElementById('graph'));
  var Apos = KPivotViewer.Views.stage.getAbsolutePosition();

  var smallCalc  = (e.originalEvent.pageX - Apos.x - cnvsPos.x)/KPivotViewer.Views.scale;
  var smallCalcY = (e.originalEvent.pageY - Apos.y - cnvsPos.y)/KPivotViewer.Views.scale;

  var endCalc = (e.originalEvent.pageX - cnvsPos.x) - cur_scale*smallCalc;
  var endCalcY = (e.originalEvent.pageY - cnvsPos.y) - cur_scale*smallCalcY;

  KPivotViewer.Views.scale = cur_scale;

  KPivotViewer.Views.stage.setPosition( endCalc, endCalcY);

  KPivotViewer.Views.layer.setScale(cur_scale);
  KPivotViewer.Views.layer2.setScale(cur_scale);
  KPivotViewer.Views.layer3.setScale(cur_scale);
  KPivotViewer.Views.layer.draw();
  KPivotViewer.Views.layer2.draw();
  KPivotViewer.Views.layer3.draw();
}

KPivotViewer.Views.reset = function() {
  KPivotViewer.Views.detail_panel.hide();
  KPivotViewer.Views.stage.setPosition( 0, 0);
  KPivotViewer.Views.scale = KPivotViewer.Views.Utils.calculate_item_width(
    KPivotViewer.Models.current_filter.length, 
    KPivotViewer.Views.stage_width, 
    KPivotViewer.Views.stage_height)/100;
  KPivotViewer.Views.layer.setScale(KPivotViewer.Views.scale);
  KPivotViewer.Views.layer2.setScale(KPivotViewer.Views.scale);
  KPivotViewer.Views.layer.draw();
  KPivotViewer.Views.layer2.draw();
}

KPivotViewer.Views.scale_to = function(scale) {
  KPivotViewer.Views.stage.setPosition( 0, 0);
  KPivotViewer.Views.scale = scale;
  KPivotViewer.Views.layer.setScale(KPivotViewer.Views.scale);
  KPivotViewer.Views.layer2.setScale(KPivotViewer.Views.scale);
  KPivotViewer.Views.layer.draw();
  KPivotViewer.Views.layer2.draw();
  if(KPivotViewer.Views.view_mode == 'column'){
    KPivotViewer.Views.layer3.setScale(KPivotViewer.Views.scale);
    KPivotViewer.Views.layer3.draw();
  }
}

KPivotViewer.Views.set_scale = function(scale){
  if (scale > KPivotViewer.Views.max_scale) { scale = KPivotViewer.Views.max_scale};
  if (scale < KPivotViewer.Views.min_scale) { scale = KPivotViewer.Views.min_scale};
  KPivotViewer.Views.scale = scale;
}

KPivotViewer.Views.draw_candidates = function(){
  KPivotViewer.Views.highlight.hide();
  if(KPivotViewer.Views.view_mode == "grid"){
    KPivotViewer.Views.draw_candidates_as_grid();
  }else if(KPivotViewer.Views.view_mode == "column"){
    KPivotViewer.Views.draw_candidates_as_column();
  }
}

KPivotViewer.Views.draw_candidates_as_grid = function() {
  for (var i = 0; i < KPivotViewer.Views.candidate_images.length; i++) {
    KPivotViewer.Views.candidate_images[i].hide();
  };
  var pos;
  var total = 0;
  var line = 0;
  var filter = KPivotViewer.Models.current_filter;

  total = filter.length;
  line = KPivotViewer.Views.Utils.calculate_item_per_row(total, KPivotViewer.Views.stage_width, KPivotViewer.Views.stage_height);

  if(total <= 0){
    KPivotViewer.Views.set_scale(1);
  }else{
    KPivotViewer.Views.set_scale(KPivotViewer.Views.Utils.calculate_item_width(total, KPivotViewer.Views.stage_width, KPivotViewer.Views.stage_height)/100);
  }

  for (var i = 0; i < filter.length; i++) {
    pos = KPivotViewer.Views.calculate_position(i,line,100);

    KPivotViewer.Views.candidate_images[filter[i]].setPosition(pos[0] + 10, pos[1] + 10);
    KPivotViewer.Views.candidate_images[filter[i]].show();
  };

  KPivotViewer.Views.scale_to(KPivotViewer.Views.scale);
  KPivotViewer.Views.update_total(total);
}

KPivotViewer.Views.draw_candidates_as_column = function() {
  for (var i = 0; i < KPivotViewer.Views.candidate_images.length; i++) {
    KPivotViewer.Views.candidate_images[i].hide();
  };
  var pos;
  var total = 0;
  var line = 0;
  var filter = KPivotViewer.Models.current_filter;

  total = filter.length;
  // ------------------
  var f_g = KPivotViewer.Views.group_facet(KPivotViewer.Views.current_sort_by_facet);
  var c_g = KPivotViewer.Views.groups_by_facet(f_g, KPivotViewer.Views.current_sort_by_facet);
  var total_column = f_g.length;
  var column_width = Math.round(KPivotViewer.Views.stage_width / total_column);
  var column_height = KPivotViewer.Views.stage_height - 50; // Padding for button
  var max_in_col = c_g[0].length;
  for (var i = c_g.length - 1; i >= 0; i--) {
    if(max_in_col < c_g[i].length){
      max_in_col = c_g[i].length;
    }
  };

  if(total <= 0){
    KPivotViewer.Views.set_scale(1);
  }else{
    scale = KPivotViewer.Views.Utils.calculate_item_width(max_in_col, column_width, column_height)/100;
    if(KPivotViewer.Views.min_scale > scale){
      KPivotViewer.Views.min_scale = scale;
    }
    KPivotViewer.Views.set_scale(scale);
  }

  line = KPivotViewer.Views.Utils.calculate_item_per_row(max_in_col, column_width, column_height);
  var y3 = KPivotViewer.Views.y3_calculation(Math.ceil(max_in_col/line),100,80);
  var col_size = (line*100+20);
  for (var i = 0; i < c_g.length; i++) {
    // draw group i
    for (var j = 0; j < c_g[i].length; j++) {
      // draw item j in group i
      pos = KPivotViewer.Views.calculate_position(j,line,100);
      pos[0] = pos[0] + col_size*i + 5;
      pos[1] = y3 - pos[1] - 100;

      KPivotViewer.Views.candidate_images[c_g[i][j]].setPosition(pos[0] + 10, pos[1] + 10);
      KPivotViewer.Views.candidate_images[c_g[i][j]].show();
    };
  };

  // -----------------------
  KPivotViewer.Views.draw_column(f_g,line,Math.ceil(max_in_col/line));
  KPivotViewer.Views.scale_to(KPivotViewer.Views.scale);

  KPivotViewer.Views.update_total(total);
}

KPivotViewer.Views.update_total = function(total){
  $(KPivotViewer.Views.total_fields).html(total);
}

KPivotViewer.Views.focus_to = function(image){
  // Navigate to the top
  var pos = image.getPosition();
  KPivotViewer.Views.scale = 3;
  KPivotViewer.Views.stage.setPosition( - pos.x*KPivotViewer.Views.scale + 10, - pos.y*KPivotViewer.Views.scale + 10);
  KPivotViewer.Views.highlight.setPosition(pos.x,pos.y);

  KPivotViewer.Views.layer.setScale(KPivotViewer.Views.scale);
  KPivotViewer.Views.layer2.setScale(KPivotViewer.Views.scale);
  KPivotViewer.Views.layer.draw();
  KPivotViewer.Views.layer2.draw();

  // Update detail
  KPivotViewer.Views.detail_panel.show(KPivotViewer.Models.find_candidate(image.candidate_id));
  KPivotViewer.Models.current_focus = image.candidate_id;
}
KPivotViewer.Views.filters.init = function(placeholder,data){
  var $placeholder = $(placeholder),
      $sort_selector = $('#sort_by_facet');
  for (var i = 0; i < data.length; i++) {
    KPivotViewer.Views.filters[i] = new KPivotViewer.Views.KFilter(data[i], i, $placeholder);

    $sort_selector.append('<option value="'+i+'">'+data[i].name+'</value>')
  };
};
KPivotViewer.Views.init_sorter = function(){
  $('#sort_by_facet').on('change',function(event){
    var i = this.value;
    KPivotViewer.Views.current_sort_by_facet = i;
    KPivotViewer.Views.detail_panel.hide();
    KPivotViewer.Models.sort_current_filter_by_facet(i);
    KPivotViewer.Views.draw_candidates();
  });
};
KPivotViewer.Views.filters.reset = function(){
  KPivotViewer.Views.detail_panel.hide();
  for (var i = KPivotViewer.Views.filters.length - 1; i >= 0; i--) {
    KPivotViewer.Views.filters[i].reset();
  };

  KPivotViewer.Models.reset_all_filter();
  KPivotViewer.Views.draw_candidates();
}

KPivotViewer.Views.detail_panel.show = function(candidate) {
  KPivotViewer.Views.layer3.hide();
  KPivotViewer.Views.layer3.draw();

  $detail = $('#' + KPivotViewer.Views.detail_panel.id);

  $detail.find('.candidate-name').html(candidate.name);
  if(candidate.url == ""){
    $detail.find('a.candidate-url').hide();
  }else{
    $detail.find('a.candidate-url').attr('href',candidate.url).show();
  }
  $facets = $detail.find('.candidate-facets').html('');
  for (var i = 0; i < KPivotViewer.Models.facets.length; i++) {
    li_class = 'odd';
    if(i % 2 == 0){
      li_class = 'even';
    }
    if(KPivotViewer.Models.facets[i].type == 'number'){
      $facets.append('<li class="detail-facet '+li_class+'">' + KPivotViewer.Models.facets[i].name + '<br/><strong>' + (Math.round(candidate.facets[i]*100)/100) + '</strong></li>');
    }else if(KPivotViewer.Models.facets[i].type == 'string'){
      $facets.append('<li class="detail-facet '+li_class+'">' + KPivotViewer.Models.facets[i].name + '<br/><strong>' + KPivotViewer.Models.facets[i].labels[candidate.facets[i]] + '</strong></li>');
    }
  };

  $detail.show();
}

KPivotViewer.Views.detail_panel.hide = function() {
  $('#' + KPivotViewer.Views.detail_panel.id).hide();
  if(KPivotViewer.Views.view_mode == 'column'){
    KPivotViewer.Views.layer3.show();
  }
}

KPivotViewer.Views.detail_panel.goto_next_candidate = function(){
  if(KPivotViewer.Views.view_mode == 'column'){
    KPivotViewer.Views.detail_panel.prev_candidate();
  }else{
    KPivotViewer.Views.detail_panel.next_candidate();
  }
};

KPivotViewer.Views.detail_panel.goto_prev_candidate = function(){
  if(KPivotViewer.Views.view_mode == 'column'){
    KPivotViewer.Views.detail_panel.next_candidate();
  }else{
    KPivotViewer.Views.detail_panel.prev_candidate();
  }
};


KPivotViewer.Views.detail_panel.next_candidate = function(){
  cur = KPivotViewer.Models.current_filter.indexOf(KPivotViewer.Models.current_focus);
  if(cur > -1 && cur < KPivotViewer.Models.current_filter.length - 1){
    KPivotViewer.Models.current_focus = KPivotViewer.Models.current_filter[cur+1];
    KPivotViewer.Views.focus_to(KPivotViewer.Views.candidate_images[KPivotViewer.Models.current_filter[cur+1]]);
  }
  return false;
}

KPivotViewer.Views.detail_panel.prev_candidate = function(){
  cur = KPivotViewer.Models.current_filter.indexOf(KPivotViewer.Models.current_focus);
  if(cur >= 1){
    KPivotViewer.Models.current_focus = KPivotViewer.Models.current_filter[cur-1];
    KPivotViewer.Views.focus_to(KPivotViewer.Views.candidate_images[KPivotViewer.Models.current_filter[cur-1]]);
  }
  return false;
};

KPivotViewer.Views.group_facet = function(facet_index){
  limit = KPivotViewer.Views.filters[facet_index].current_filter();
  if(KPivotViewer.Models.facets[facet_index].type == 'number'){
    if(limit.max <= limit.min){
      // Only 1 col
      return [limit.min];
    }
    if(limit.max - limit.min <= KPivotViewer.Views.max_column*0.1){
      // calculate number of column
      groups = [limit.min];
      p = Math.round((limit.min+0.1)*10)/10;
      while(p < limit.max){
        groups.push(p);
        p += step;
      }
      groups.push(limit.max);
    }else{
      // calculate step
      step = (limit.max - limit.min)/KPivotViewer.Views.max_column
      groups = [limit.min];
      p = Math.round((limit.min+step)*10)/10;
      while(p < limit.max){
        groups.push(p);
        p = Math.round((p+step)*10)/10;
      }
      groups.push(limit.max);
    }
    while(groups.length > KPivotViewer.Views.max_column+1){
      groups.splice(groups.length-2,1);
    }
    return groups;
  }else if(KPivotViewer.Models.facets[facet_index].type == 'string'){
    if(limit.length > KPivotViewer.Views.max_column){
      floor = Math.floor(limit.length / KPivotViewer.Views.max_column);
      left = limit.length % KPivotViewer.Views.max_column;
      groups = []
      for (var i = 0; i < KPivotViewer.Views.max_column; i++) {
        if(left > 0){
          groups[i] = limit.splice(0,floor+1);
        }else{
          groups[i] = limit.splice(0,floor);
        }
        left--;
      };

      return groups;
    }else{
      for (var i = limit.length - 1; i >= 0; i--) {
        limit[i] = [limit[i]];
      };
      return limit;
    }
  }
  return [];
};

KPivotViewer.Views.groups_by_facet = function(grouped_facet, facet_index){
  result = [];

  if(grouped_facet.length == 1){
    return [KPivotViewer.Models.current_filter];
  }

  if(KPivotViewer.Models.facets[facet_index].type == 'number'){
    for (var j = 0; j < grouped_facet.length - 1 ; j++) {
      result[j] = [];
    };
    for (var i = KPivotViewer.Models.current_filter.length - 1; i >= 0; i--) {
      value = KPivotViewer.Models.source[KPivotViewer.Models.current_filter[i]].facets[facet_index];
      added = false;
      for (var j = 0; j < grouped_facet.length - 1 ; j++) {
        if(grouped_facet[j] <= value && value < grouped_facet[j+1]){
          result[j].push(KPivotViewer.Models.current_filter[i]);
          added = true;
        }
      };
      if(!added){
        result[result.length -1 ].push(KPivotViewer.Models.current_filter[i])
      }
    };

    return result;

  }else if(KPivotViewer.Models.facets[facet_index].type == 'string'){
    for (var j = 0; j < grouped_facet.length ; j++) {
      result[j] = [];
    };
    for (var i = KPivotViewer.Models.current_filter.length - 1; i >= 0; i--) {
      value = KPivotViewer.Models.source[KPivotViewer.Models.current_filter[i]].facets[facet_index];
      for (var j = 0; j < grouped_facet.length; j++) {
        if(grouped_facet[j].indexOf(value) >= 0){
          result[j].push(KPivotViewer.Models.current_filter[i]);
          added = true;
        }
      };
    };

    return result;

  }
  return [];
};

KPivotViewer.Views.grid_view = function(){
  KPivotViewer.Views.detail_panel.hide();
  $('img.view-style.view-style-grid').attr('src','/images/gridview_selected.png');
  $('img.view-style.view-style-graph').attr('src','/images/graphview.png');
  KPivotViewer.Views.detail_panel.hide();

  KPivotViewer.Views.layer3.hide();

  KPivotViewer.Views.view_mode = "grid";
  KPivotViewer.Views.draw_candidates();
};

KPivotViewer.Views.graph_view = function(){
  KPivotViewer.Views.detail_panel.hide();
  $('img.view-style.view-style-grid').attr('src','/images/gridview.png');
  $('img.view-style.view-style-graph').attr('src','/images/graphview_selected.png');
  KPivotViewer.Views.detail_panel.hide();

  KPivotViewer.Views.layer3.show();

  KPivotViewer.Views.view_mode = "column";
  KPivotViewer.Views.draw_candidates();
};

KPivotViewer.Views.draw_column = function(columns, item_per_line,num_rows){
  for (var i = KPivotViewer.Views.column_labels.length - 1; i >= 0; i--) {
    KPivotViewer.Views.column_labels[i].hide();
    KPivotViewer.Views.column_backgrounds[i].hide();
  };

  y3 = KPivotViewer.Views.y3_calculation(num_rows,100,80);

  for (var i = 0; i < columns.length; i++) {
    if(KPivotViewer.Views.column_labels[i] == undefined){continue;}

    KPivotViewer.Views.column_backgrounds[i].setWidth(item_per_line*100);
    KPivotViewer.Views.column_backgrounds[i].setHeight(y3);
    KPivotViewer.Views.column_backgrounds[i].setY(0);
    KPivotViewer.Views.column_backgrounds[i].setX(item_per_line*100*i+20*i+10);
    KPivotViewer.Views.column_backgrounds[i].show();

    KPivotViewer.Views.column_labels[i].getText().setWidth(item_per_line*100);
    KPivotViewer.Views.column_labels[i].getText().setHeight(Math.round(50/KPivotViewer.Views.scale));
    KPivotViewer.Views.column_labels[i].getText().setFontSize(Math.round(16/KPivotViewer.Views.scale));
    KPivotViewer.Views.column_labels[i].setX(i*(item_per_line*100+20) + 10);
    KPivotViewer.Views.column_labels[i].setY(y3+20);

    if (KPivotViewer.Models.facets[KPivotViewer.Views.current_sort_by_facet].type == 'number') {
      if(columns[i+1] == undefined){
        KPivotViewer.Views.column_labels[i].getText().setText(columns[i]);
        KPivotViewer.Views.column_labels[i].column_data = [columns[i],columns[i]];
      }else{
        KPivotViewer.Views.column_labels[i].getText().setText(columns[i]+" to "+columns[i+1]);
        KPivotViewer.Views.column_labels[i].column_data = [columns[i],columns[i+1]];
      }
    } else if(KPivotViewer.Models.facets[KPivotViewer.Views.current_sort_by_facet].type == 'string'){
      if(columns[i].length <= 1){
        KPivotViewer.Views.column_labels[i].getText().setText(KPivotViewer.Models.facets[KPivotViewer.Views.current_sort_by_facet].labels[columns[i][0]]);
      }else{
        KPivotViewer.Views.column_labels[i].getText().setText(KPivotViewer.Models.facets[KPivotViewer.Views.current_sort_by_facet].labels[columns[i][0]]
          + " to "
          + KPivotViewer.Models.facets[KPivotViewer.Views.current_sort_by_facet].labels[columns[i][columns[i].length-1]]);
      }
      KPivotViewer.Views.column_labels[i].column_data = columns[i];
    };

    KPivotViewer.Views.column_labels[i].show();
  };
};

