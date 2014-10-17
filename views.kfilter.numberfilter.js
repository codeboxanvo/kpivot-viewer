KPivotViewer.Views.KFilter.NumberFilter = function() {
  this.initialized = false;
  this.facet = null;
  this.facet_index = 0;
  this.id = '';
  this.data = [ 
    { label: 'inactive-left', color:'#cccccc', data: [] },
    { label: 'active', color:'#4682B4', data: [] },
    { label: 'inactive-right', color:'#cccccc', data: [] }
  ];
  this.plot = null;
  this.slider = null;

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
      <div style="font-size:10px;color:grey;font-style:italic;padding-left: 10px;"><span class="min-value">0</span>-<span class="max-value">0</span></div> \
        <div class="filter-container"> \
        <div style="padding: 0px; position: relative;width: 100%;height: 80%;font-size: 14px;line-height: 1.2em;" class="chart"></div> \
          <div style="padding-top:10px;"> \
            <div class="slider" style="font-size: 10px;"></div> \
          </div> \
        </div> \
      </p> \
      </div>');

    $placeholder.find(".button-reset-filter-"+index).on('click', function(){
      KPivotViewer.Views.filters[parseInt($(this).attr('data-facet-index'))].reset();
      $(this).hide();
    });

    this.init_number_filter(facet, id, index);
    this.initialized = true;
  };
  this.update_to = function(new_data){
    new_data[0] *= 10;
    new_data[1] *= 10;
    console.log(new_data);
    var $placeholder = $("#" + this.id),

    f = 0;
    this.data[0].data = []
    this.data[1].data = []
    this.data[2].data = []
    for (var i = 0; i < this.facet.data.length; i++) {
      f = 1;
      if(i < new_data[0]){ f = 0 }
      if(i >= new_data[1]){ f = 2 }
      this.data[f].data.push([i + 1, this.facet.data[i]]);
    };

    $placeholder.find('span.min-value').html(Math.round((this.facet.min + new_data[0]*this.facet.step)*10)/10);
    $placeholder.find('span.max-value').html(Math.round((this.facet.min + new_data[1]*this.facet.step)*10)/10);

    this.plot.setData(this.data);
    this.plot.draw();

    this.slider.slider("values",0, Math.round((this.facet.min + new_data[0]*this.facet.step)*10));
    this.slider.slider("values",1, Math.round((this.facet.min + new_data[1]*this.facet.step)*10));

    this.slider.trigger('slidestop');
  }
  this.reset = function(){
    var $placeholder = $("#" + this.id);

    this.data[0].data = [];
    this.data[2].data = [];
    for (var i = 0; i < this.facet.data.length; i++) {
      this.data[1].data.push([i + 1, this.facet.data[i]]);
    };
    $placeholder.find('span.min-value').html(this.facet.min);
    $placeholder.find('span.max-value').html(this.facet.max);

    this.plot.setData(this.data);
    this.plot.draw();

    this.slider.slider("values",0, 0);
    this.slider.slider("values",1, this.facet.data.length);

    this.slider.trigger('slidestop');
  };
  this.init_number_filter = function(facet, id, index){
    this.data[0].data = [];
    this.data[2].data = [];
    for (var i = 0; i < this.facet.data.length; i++) {
      this.data[1].data.push([i+1, this.facet.data[i]]);
    };
    var $placeholder = $("#" + id);
    this.plot = $.plot($placeholder.find(".chart"), this.data, {
      series: {
        stack: 1,
        bars: {
          show: true,
          barWidth: 0.9,
          align: "center",
          fill: 1
        }
      },
      xaxis: {
        mode: "categories",
        tickLength: 0,
        show: false
      },
      yaxis: {
        show: false
      },
      grid: {
        show: false
      },
      legend: {
        show: false
      }
    });

    var data = this.data;
    var facet = this.facet;
    var plot = this.plot;
    var facet_index = this.facet_index;

    $placeholder.find('span.min-value').html(facet.min);
    $placeholder.find('span.max-value').html(facet.max);

    this.slider = $placeholder.find(".slider").slider({
      range: true,
      min: 0,
      max: facet.data.length,
      values: [ 0, facet.data.length ],
      slide: function(event, ui) {
        f = 0;
        data[0].data = []
        data[1].data = []
        data[2].data = []
        for (var i = 0; i < facet.data.length; i++) {
          f = 1;
          if(i < ui.values[0]){ f = 0 }
          if(i >= ui.values[1]){ f = 2 }
          data[f].data.push([i + 1, facet.data[i]]);
        };

        $placeholder.find('span.min-value').html(Math.round((facet.min + ui.values[0]*facet.step)*10)/10);
        $placeholder.find('span.max-value').html(Math.round((facet.min + ui.values[1]*facet.step)*10)/10);

        plot.setData(data);
        plot.draw();
      }
    });
    this.slider.on('slidestop', function(event, ui){
      // Update KPivotViewer.Models.filter
      if(ui != undefined){
        left = ui.values[0];
        right = ui.values[1];
      }else {
        left = $(this).slider("values",0);
        right = $(this).slider("values",1);
      }

      KPivotViewer.Models.update_filter(facet_index, 
        KPivotViewer.Models.filter_by_number_facet(facet_index,
          Math.round((facet.min + left*facet.step)*10)/10, 
          Math.round((facet.min + right*facet.step)*10)/10));
      KPivotViewer.Views.draw_candidates();
      KPivotViewer.Views.detail_panel.hide();

      if(left > 0 || right < facet.data.length){
        $(".button-reset-filter-" + facet_index).show();
      }else{
        $(".button-reset-filter-" + facet_index).hide();
      }
    });
  };
  this.current_filter = function(){
    left = $(this.slider).slider("values",0);
    right = $(this.slider).slider("values",1);
    return {
      min: Math.round((this.facet.min + left*this.facet.step)*10)/10,
      max: Math.round((this.facet.min + right*this.facet.step)*10)/10
    };
  };
};