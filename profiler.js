KPivotViewer.profiler = {};
KPivotViewer.profiler.prev_tick = null;
KPivotViewer.profiler.reset = function(){
  KPivotViewer.profiler.prev_tick = new Date();
  console.log("==========> Reset to : " + KPivotViewer.profiler.prev_tick.getTime());
};
KPivotViewer.profiler.tick = function(){
  n = new Date();
  console.log("==========> Diff : " + (n - KPivotViewer.profiler.prev_tick));
  KPivotViewer.profiler.prev_tick = n;
};