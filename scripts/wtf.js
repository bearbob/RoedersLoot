//http://urls.api.twitter.com/1/urls/count.json?url=http://bearbob.github.io/WTFDSA/
var WTF = (function() {

    'use strict';

    /*
      ------------------------------------------------------------

        Constants & variables

      ------------------------------------------------------------
    */

    var RE_QUOTE = /\"([^\"]+)\"/gi;
    var RE_JSON = /\.json$/i;
    var RE_KEY = /[a-z0-9_-]{32,}/i;
    var DOCS_PATH = 'https://docs.google.com/spreadsheet/pub?key={key}&output=csv';

    var templates;
    var responses;
    var headings;
    var corpus;
    var regex;
    var dom;
    var ref = ""; //the reference parameter for the character
    var param = getUrlParameter('id');

    /*
      ------------------------------------------------------------

        Called once initialisation as finished

      ------------------------------------------------------------
    */

    function start() {
        
        // Copy out templates then remove from corpus

        templates = corpus.template;
        responses = corpus.response;
        headings = corpus.heading;

        delete corpus.template;
        delete corpus.response;
        delete corpus.heading;

        // Enable UI and generate first idea

        initUI();
        buildRexExp();
        generate();
        
        count();
        
    }
    
    function count() {
        /* single vars */
        var packungcontent = 11;
        var dosecontent = 12;
        var adjectbase = 15;
        var color = 9;
        var adjective = 221;
        var glascontent = 15;
        var haufencontent = 9;
        var obstsorten = 10;
        var prefobject = 67;
        var femaleobject = 24;
        var waldtierbeute = 22;
        var actor = 12;
        var teammembers = 3;
        var enemy = 6;
        var readthis = 9;
        var wohnort = 6;
        var indrhyme = 5;
        var dothis = 8;
        /* connected vars */
        var maleitem = 39 + color;
        var searchobject = 6 + teammembers;
        var actionforitem = 8 + (adjective * femaleobject * dothis);
        var pieceof = 6 + obstsorten;
        var femaleadjectiv = 1 + adjectbase;
        var maleadjectiv = 1 + adjectbase;
        var neutraladjectiv = 1 + adjectbase;
        var femaleitem = 33 + (adjective * femaleobject) + packungcontent + dosecontent + adjective;
        var neutralitem = 20 + haufencontent + glascontent + pieceof;
        var item = (neutraladjectiv * neutralitem) + (maleadjectiv + maleitem) + (femaleadjectiv + femaleitem);
        var says = 8 + (3* prefobject) + wohnort + readthis + waldtierbeute;
        var poem = indrhyme;
        
        /* root node */
        var template = item*( 5 + searchobject + 3*actor + actionforitem) + enemy + 2*(adjective * femaleobject) + says + poem;
        
        $("#count").text(template);
    }

    /*
      ------------------------------------------------------------

        Converts CSV to a regular corpus object
        @see sample.json

      ------------------------------------------------------------
    */

    function parseCSV( csv ) {

        var corpus = {};

        var i, j, k, n, m, cols, keys = {}, data = {}, rows = csv.split( '\n' );

        for ( i = 0, n = rows.length; i < n; i++, j = i - 1 ) {

            cols = rows[ i ].replace( RE_QUOTE, escape ).split( ',' );

            for ( k = 0, m = cols.length; k < m; k++ ) {

                if ( i === 0 ) {

                    data[ keys[ k ] = cols[ k ].toLowerCase() ] = [];

                } else if ( cols[ k ] ) {

                    data[ keys[ k ] ][ j ] = unescape( cols[ k ] ).replace( /^\"|\"$/g, '' );
                }
            }
        }

        return data;
    }
    
     /*
      ------------------------------------------------------------

        Read URL parameter

      ------------------------------------------------------------
    */
    
    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) 
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) 
            {
                return sParameterName[1];
            }
        }
        return "";
    } 

    /*
      ------------------------------------------------------------

        Binds event handlers to control the interface

      ------------------------------------------------------------
    */

    function initUI() {

        $( '.loading' ).remove();

        dom = {
            generate: $( '#generate' ),
            output: $( '#output' )
        };

        dom.generate.click( function() {
            param = "";
            generate();
            return false;
        });
    }

    /*
      ------------------------------------------------------------

        Builds a regular expression for all types in the corpus

      ------------------------------------------------------------
    */

    function buildRexExp() {

        var types = [];

        for ( var type in corpus )

            types.push( type );

        var content = '@(type)'.replace( 'type', types.join( '|' ) );

        regex = new RegExp( content, 'gi' );
    }
    
    /*
      ------------------------------------------------------------

        Generates ideas based on the corpus

      ------------------------------------------------------------
    */

    function generate() {
        
        //reset reference
        ref = "";
        
        var temp;
        
        var type, text, part, iter = 0, // Safety mechanism
            idea = randomItem( templates, false, true ),
            item = regex.exec( idea ),
            copy = cloneCorpus();
        
        //if parameter was used, parse the idea template
        if(param.length > 0){
            //before parsing, set ref to param
            ref = param;
            //parse
            temp = decodeNum(param.substring(0,2));
            idea = templates[temp];
            //console.log("index: "+temp+"(hex: "+ param.substring(0,2) + ")//" +idea);
            param = param.substring(2);
        }
        
        //console.log("Encode 1337: "+ encodeNum("1337"));
        //console.log("Decode 1337: "+ decodeNum(encodeNum("1337")));
        
        while ( item && ++iter < 1000 ) {

            type = item[ 0 ];
            text = item[ 1 ];

            //console.log( text, copy, copy[ text ] );
            if(param.length > 0){
                temp = decodeNum(param.substring(0,2));
                part = copy[ text ][temp];
                //console.log("index: "+temp+"(hex: "+ param.substring(0,2) + ")//" +part);
                param = param.substring(2);
            }else{
                part = randomItem( copy[ text ], true, true );
            }
            idea = idea.replace( type, part );

            regex.lastIndex = 0;
            item = regex.exec( idea );
        }

        // Update output

        dom.generate.text( randomItem( responses ) );
        dom.output.html(
            '<dl>' +
                '<dt>' + randomItem( headings ) + '</dt>' +
                '<dd>' + idea + '</dd>' +
            '</dl>'
        );
            
        var tweet = "Geronimo wird " + idea;
        $("#share-twitter").html(
            '<a href="https://twitter.com/intent/tweet?button_hashtag=roedersimulator&text='+
            encodeURIComponent(tweet.substring(0,140)) +
            '" class="twitter-hashtag-button" data-related="tripletwenty_" data-via="tripletwenty_" ' + 
            ' data-show-count="true">Tweet #spitzestifte</a>'+
            ' <script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>'
        );
        
        
        //console.log("ref: "+ ref);

        // Toggle animation

        setTimeout( showOutput, 0 );
        hideOutput();
    }

    function hideOutput() {

        dom.output.removeClass( 'animate' ).css( 'opacity', 0 );
    }

    function showOutput() {

        dom.output.addClass( 'animate' ).css( 'opacity', 1 );
    }

    function randomItem( list, remove, useRef ) {

        var index = ~~( Math.random() * list.length );
        var item = list[ index ];
        
        if( useRef ) {
            //add index to the ref
            var hex = encodeNum(index);
            while(hex.length < 2){
                hex = '0'+hex;
            }
            //console.log("index: "+index+"(hex: "+ hex + ")//" +item);
            ref += hex;
        }

        if ( remove && list.length > 1 ){
            //at position index 1 item will be removed
            list.splice( index, 1 );
        }

        return item;
    }

    function cloneCorpus() {

        var copy = {};

        for ( var key in corpus )

            copy[ key ] = corpus[ key ].concat();
        
        return copy;
    }

    /*
      ------------------------------------------------------------

        Public API

      ------------------------------------------------------------
    */

    return {

        /*

            Expects one of the following:

                1.  An object with `templates` and any amount of keys for word types, for example:
        
                    {
                        templates: [ 'The @color @animal', 'The @animal was @color' ],
                        animal: [ 'dog', 'cat', 'rabbit' ],
                        color: [ 'red', 'green', 'blue' ],
                    }

                2.  A path to a JSON file with the same structure as above (see `sample.json`)

                3.  A Google spreadsheet key (e.g 0AvG1Hx204EyydF9ub1M2cVJ3Z1VGdDhTSWg0ZV9LNGc)
                    You must first publish the spreadsheet as a CSV 
                    @see https://support.google.com/drive/answer/37579?hl=en

        */

        init: function( data ) {

            if ( !data ) throw data + ' is not a valid corpus';

            if ( typeof data === 'string' ) {

                if ( RE_JSON.test( data ) ) {

                    // JSON

                    $.ajax({
                        url: data,
                        dataType: 'json',
                        success: function( data, status, xhr ) {
                            corpus = data;
                            start();
                        },
                        error: function( xhr, errorType, error ) {
                            throw 'Cannot load JSON data: ' + error;
                        }
                    });

                } else if ( RE_KEY.test( data ) ) {

                    // CSV

                    $.ajax({
                        url: DOCS_PATH.replace( '{key}', data ),
                        success: function( data, status, xhr ) {
                            corpus = parseCSV( data );
                            start();
                        },
                        error: function( xhr, errorType, error ) {
                            throw 'Cannot load spreadsheet. Is it published? (@see https://support.google.com/drive/answer/37579?hl=en)';
                        }
                    });

                } else {

                    throw 'Unrecognised data format: ' + data;
                }

            } else if ( typeof data === 'object' ) {

                // Object

                corpus = data;
                start();
            }
        },

        // Expose certain methods

        generate: generate
    };

})();
