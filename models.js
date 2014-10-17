KPivotViewer.Models = {};
KPivotViewer.Models.source = [];
KPivotViewer.Models.filters = [];
KPivotViewer.Models.facets = [];
KPivotViewer.Models.current_filter = [];
KPivotViewer.Models.current_focus = -1;

KPivotViewer.Models.init = function(source, facets) {
  KPivotViewer.Models.source = source;
  KPivotViewer.Models.facets = facets;
  for (var i = 0; i < KPivotViewer.Models.facets.length; i++) {
    KPivotViewer.Models.filters[i] = [];
  };
  for (var i = 0; i < KPivotViewer.Models.source.length; i++) {
    KPivotViewer.Models.current_filter.push(KPivotViewer.Models.source[i].id);

    for (var j = 0; j < KPivotViewer.Models.facets.length; j++) {
      KPivotViewer.Models.filters[j].push(KPivotViewer.Models.source[i].id);
    };
  };
  KPivotViewer.Models.sort_current_filter_by_facet(0);
}

KPivotViewer.Models.filter_by_facet = function(facet_index, data) {
  if(KPivotViewer.Models.facets[facet_index].type == 'number'){
    return KPivotViewer.Models.filter_by_number_facet(facet_index,data.from_value,data.to_value);
  }
  if(KPivotViewer.Models.facets[facet_index].type == 'string'){
    return KPivotViewer.Models.filter_by_string_facet(facet_index,data);
  }
  return false;
}

KPivotViewer.Models.filter_by_string_facet = function(facet_index, data) {
  var result = [];
  for (var i = KPivotViewer.Models.source.length - 1; i >= 0; i--) {
    if($.inArray(KPivotViewer.Models.source[i].facets[facet_index],data) >= 0){
      result.push(KPivotViewer.Models.source[i].id);
    }
  };

  return result;
}

KPivotViewer.Models.filter_by_number_facet = function(facet_index, from_value, to_value) {
  var result = [];
  if(from_value < to_value) {
    for (var i = KPivotViewer.Models.source.length - 1; i >= 0; i--) {
      if(KPivotViewer.Models.source[i].facets[facet_index] >= from_value && KPivotViewer.Models.source[i].facets[facet_index] <= to_value){
        result.push(KPivotViewer.Models.source[i].id);
      }
    };
  }else{
    for (var i = KPivotViewer.Models.source.length - 1; i >= 0; i--) {
      if(KPivotViewer.Models.source[i].facets[facet_index] == from_value){
        result.push(KPivotViewer.Models.source[i].id);
      }
    };
  }

  return result;
}

KPivotViewer.Models.update_filter = function(facet_index, new_filter) {
  var old_filter = KPivotViewer.Models.filters[facet_index],
      d1 = [],
      d2 = [];
  for (var i = 0; i < old_filter.length; i++) {
    if(new_filter.indexOf(old_filter[i]) < 0) { d1.push(old_filter[i]); }
  };
  for (var i = 0; i < new_filter.length; i++) {
    if(old_filter.indexOf(new_filter[i]) < 0) { d2.push(new_filter[i]); }
  };

  // Remove d1 in current_filter 
  for (var i = 0; i < d1.length; i++) {
    j = KPivotViewer.Models.current_filter.indexOf(d1[i]);
    if(j >= 0) { KPivotViewer.Models.current_filter.splice(j,1); }
  };
  // Check d2 in other filter
  for (var j = 0; j < d2.length; j++) {
    add = true;
    for (var i = 0; i < KPivotViewer.Models.filters.length; i++) {
      if(i == facet_index) { continue; }
      if(KPivotViewer.Models.filters[i].indexOf(d2[j]) < 0) {
        add = false;
        break;
      }
    };
    if(add) {
      KPivotViewer.Models.current_filter.push(d2[j]);
    }
  };

  KPivotViewer.Models.filters[facet_index] = new_filter;
};

KPivotViewer.Models.find_candidate = function(candidate_id) {
  for (var i = KPivotViewer.Models.source.length - 1; i >= 0; i--) {
    if(KPivotViewer.Models.source[i].id == candidate_id) {
      return KPivotViewer.Models.source[i];
    }
  };
  return null;
};

KPivotViewer.Models.reset_all_filter = function() {
  for (var i = 0; i < KPivotViewer.Models.facets.length; i++) {
    KPivotViewer.Models.filters[i] = [];
  };
  KPivotViewer.Models.current_filter = []
  for (var i = 0; i < KPivotViewer.Models.source.length; i++) {
    KPivotViewer.Models.current_filter.push(KPivotViewer.Models.source[i].id);

    for (var j = 0; j < KPivotViewer.Models.facets.length; j++) {
      KPivotViewer.Models.filters[j].push(KPivotViewer.Models.source[i].id);
    };
  };
};

KPivotViewer.Models.sort_current_filter_by_facet = function(facet_index){
  KPivotViewer.Models.current_filter.sort(function(a,b){
    return KPivotViewer.Models.source[a].facets[facet_index] - KPivotViewer.Models.source[b].facets[facet_index]
  });
};
