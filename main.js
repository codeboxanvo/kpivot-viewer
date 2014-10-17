var KPivotViewer = KPivotViewer || {};
KPivotViewer.init = function(source, facets, canvasId, width, height, sliderId, detailId) {
  KPivotViewer.Models.init(source, facets);
  KPivotViewer.Views.init(canvasId, width, height, detailId);

  KPivotViewer.Views.filters.init("#" + sliderId, facets);
  $("#" + sliderId).accordion();
  KPivotViewer.Views.init_sorter();
}
KPivotViewer.clear_filter = function(){
  KPivotViewer.Views.filters.reset();
}