// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

  "use strict";

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "priceRange",
        defaults = {
        nullValue: "Any price",
        items: {
          'for_sale': {
            min: [
              {value:'0', text:'$0', type: 'sale'},
              {value:'50000000', text:'$50.000.000', type: 'sale'},
              {value:'80000000', text:'$80.000.000', type: 'sale'},
              {value:'100000000', text:'$100.000.000', type: 'sale'},
              {value:'150000000', text:'$150.000.000', type: 'sale'},
              {value:'200000000', text:'$200.000.000', type: 'sale'},
              {value:'250000000', text:'$250.000.000', type: 'sale'},
              {value:'500000000', text:'$500.000.000', type: 'sale'},
            ],
            max: [
              {value:'100000000', text:'$100.000.000', type: 'sale'},
              {value:'150000000', text:'$150.000.000', type: 'sale'},
              {value:'200000000', text:'$200.000.000', type: 'sale'},
              {value:'250000000', text:'$250.000.000', type: 'sale'},
              {value:'500000000', text:'$500.000.000', type: 'sale'},
              {value:'500000000', text:'$550.000.000', type: 'sale'},
              {value:'600000000', text:'$600.000.000', type: 'sale'},
              {value:'', text: '+', type: 'sale'},
            ],
        },
          'for_rent': [
            {value:'0', text:'$0', type: 'min'},
            {value:'500000', text:'$500.000', type: 'min'},
            {value:'800000', text:'$800.000', type: 'min'},
            {value:'1000000', text:'$1.000.000', type: 'min'},
            {value:'1500000', text:'$1.500.000', type: 'min'},
            {value:'2000000', text:'$2.000.000', type: 'min'},
            {value:'2500000', text:'$2.500.000', type: 'min'},
            {value:'5000000', text:'$5.000.000', type: 'min'},
          ]
        },
        wrapper: $('<div>',{ 'class': 'dropdown' }),
        button: $('<button>',{ 
          'id': 'btn-filter',
          'type':'button',
          'data-toggle':'dropdown',
          'class': 'btn btn-dropdown dropdown-toggle',
          'aria-haspopup':'true',
          'aria-expanded':'false',
          'html': '  <span class="caret"></span>'
        }),
        listWrapper: $('<div>',{ 'class':'dropdown-menu', 'role':'menu' }),
        listSaleMin: $('<ul id="lst-sale-min" class="price-list list-unstyled text-left" >'),
        listSaleMax: $('<ul id="lst-sale-max" class="price-list list-unstyled text-right hide" >'),
        listRentMin: $('<ul id="lst-rent-min" class="price-list" >'),
        buttonLabel: $('<span>')
      }

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = element;
        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        render: function ($elem) {

            var listWrapper = this.settings.listWrapper;
            var listSaleMin = this.settings.listSaleMin;
            var listSaleMax = this.settings.listSaleMax;
            var listRentMin = this.settings.listRentMin;
            var selectedElement = false;

            listWrapper.append(this.renderInputs(this));

            // Iterate through the items and add them to the list
            listSaleMin.append(this.renderList( this.settings.items['for_sale'].min, this.itemClickEventMin ));

            listSaleMax.append(this.renderList( this.settings.items['for_sale'].max, this.itemClickEventMax ));

            listWrapper.append(listSaleMin);
            listWrapper.append(listSaleMax);

            var buttonText = this.settings.nullValue;
            this.settings.buttonLabel.html(buttonText);

            $(this.settings.buttonLabel).bind('change.filter.text', function(event, min, max) {
              $(this).html(min + ' - ' + max);
            });

            this.settings.button.prepend(this.settings.buttonLabel);
            this.settings.wrapper.append(this.settings.button);
            this.settings.wrapper.append(listWrapper);
            this.settings.wrapper.insertAfter($elem);

            $(this.settings.button).dropdown();
            $('#btn-filter').on('shown.bs.dropdown', this.focusMinInput);

        },
        // Create a list of items in the list
        // and adds the fnItemEvent to each item
        renderList: function (items, fnItemEvent) {
            var list = [];

            $.each(items, function(index, item) {

              var listItem = $('<li>');
              var actionItem = $('<a>',{
                'data-value': item.value,
                'data-type': item.type,
                'text': item.text,
                'role': 'menuitem',
                'href': 'javascript:void(0)',
                'tabindex': '0'
              }).appendTo(listItem);

              if( item.active ){
                actionItem.addClass('active');
              }

              actionItem.click(fnItemEvent);

              list.push(listItem);
            });

            return list;
        },

        renderInputs: function (self) {
            // The custum value inputs
            var boxTemplate = '<div class="row">' +
              '<div class="col-xs-6">'+
              '    <input id="range_field_min" type="text" name="range_min">'+
              '</div>'+
              '<div class="col-xs-6">'+
              '    <input id="range_field_max" type="text" name="range_max">'+
              '</div>' +
              '</div>';
            var boxes = $('<div>').append(boxTemplate);
            boxes.click(function(event) {
              event.stopPropagation();
            });

            $('#range_field_min').on('focusin',function(event) {
              console.log('ok');
              self.settings.listSaleMin.removeClass('hide');
              self.settings.listSaleMax.addClass('hide');
            });
            
            return boxes;
        },

        itemClickEventMin: function (e) {
          var type = $(this).data('type');
          var value = $(this).data('value');
          var input_min = $('#range_field_min');
          var input_max = $('#range_field_max');

          $(this).trigger('change.filter.text',value);
          input_min.val(value);

          $(this).parents('.price-list').addClass('hide');
          $('#lst-'+type+'-max').removeClass('hide');

          e.stopPropagation();
        },

        itemClickEventMax: function (e) {
          var type = $(this).data('type');
          var value = $(this).data('value');
          var input_min = $('#range_field_min');
          var input_max = $('#range_field_max');

          input_max.val(value);

        },

        focusMinInput: function () {
          console.log('focus');
          $('#range_field_min').focus();
        },

        init: function () {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.settings
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.settings).

            this.render(this.element);
        },
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
        return this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });
    };

})( jQuery, window, document );
