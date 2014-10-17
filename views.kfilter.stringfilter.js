KPivotViewer.Views.KFilter.StringFilter = function() {
  this.initialized = false;
  this.facet = null;
  this.facet_index = 0;
  this.id = '';

  this.init = function(facet, index, $placeholder){
    var id = "filter-" + (index + 1);
    this.facet = facet;
    this.facet_index = index;
    this.id = id;
    $placeholder.append('<h5 class="filter-title" style="font-size:12px;padding-left:8px;"> \
          <table style="background:transparent;padding:0px;"> \
            <tr><td style="background:transparent;padding:0px;border:0px;">'+facet.name+'</td> \
                <td style="background:transparent;padding:0px;border:0px;vertical-align:top;"> \
                  <img src="/images/filter_panel_clear.png" class="hidden button-reset-filter button-reset-filter-'+index+'" data-facet-index="'+index+'" /> \
            </td></tr></table></h5> \
      <div style="padding:0px;" id="'+id+'"> \
      <p> \
      <div class="filter-container"></div> \
      </p> \
      </div>');

    $placeholder.find(".button-reset-filter-"+index).on('click', function(){
      KPivotViewer.Views.filters[parseInt($(this).attr('data-facet-index'))].reset();
      $(this).hide();
    });

    this.init_string_filter(facet, id, index);
    this.initialized = true;
  };
  this.update_to = function(new_data){// do it here
    $("input.filter-string-"+this.facet_index).each(function(){
      if(new_data.indexOf(parseInt($(this).attr('data-filter-data-index'))) >= 0 ){
        $(this).prop('checked',true);
      }else{
        $(this).prop('checked',false);
      }
    });
    $("input.filter-string-"+this.facet_index).trigger('change');
  }
  this.reset = function(){
    $("input.filter-string-"+this.facet_index).prop('checked',true);
    $("input.filter-string-"+this.facet_index+":first").trigger('change');
  };
  this.init_string_filter = function(facet, id, index){
    li_content = '';
    for (var i = 0; i < facet.labels.length; i++) {
      li_content = li_content + '<tr style="background-color:transparent;"> \
        <td style="vertical-align:top;background-color:transparent;border:0px;padding:0px;width:10px;"><input type="checkbox" checked="checked" class="filter-string filter-string-'+index+'" data-filter-data-index="'+i+'" data-filter-index="'+index+'"></td> \
        <td style="vertical-align:top;background-color:transparent;border:0px;padding:0px;width:*;">'+facet.labels[i]+'</td> \
        <td style="vertical-align:top;background-color:transparent;border:0px;padding:0px;width:40px;text-align:right;font-style:italic;">'+facet.data[i]+'</td></tr>'
    };
    $content = $('<table style="width:100%;padding:0px;font-size:11px;margin:0px;vertical-align:top;border:0px;background-color:transparent;">'+li_content+'</table>');
    $content.find('.filter-string').on('change',function(){
      var facet_index = $(this).attr("data-filter-index");
      var data_index = $(this).attr("data-filter-data-index");
      var filtered_data_index = []
      var is_filtered = false;
      $("input.filter-string-"+facet_index).each(function(){
        if($(this).is(':checked')){
          filtered_data_index.push(parseInt($(this).attr("data-filter-data-index")));
        }else {
          is_filtered = true;
        }
      });
      if(is_filtered){
        $(".button-reset-filter-" + facet_index).show();
      }else{
        $(".button-reset-filter-" + facet_index).hide();
      }
      KPivotViewer.Models.update_filter(facet_index,
        KPivotViewer.Models.filter_by_string_facet(facet_index,filtered_data_index));
      KPivotViewer.Views.draw_candidates();
      KPivotViewer.Views.detail_panel.hide();
    });
    this.filter_container = $("#" + id).find('.filter-container')
    this.filter_container.html($content);
  };
  this.current_filter = function(){
    return this.filter_container.find('input.filter-string:checked').map(function(){ return $(this).data('filter-data-index') });
  };
};