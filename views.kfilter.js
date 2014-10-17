KPivotViewer.Views.KFilter = function(data, i, $placeholder){
  f = null;
  if(data.type == 'string'){
    f = new KPivotViewer.Views.KFilter.StringFilter();
    f.init(data, i, $placeholder);
  }else if(data.type == 'number'){
    f = new KPivotViewer.Views.KFilter.NumberFilter();
    f.init(data, i, $placeholder);
  }

  return f;
};