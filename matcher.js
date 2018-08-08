
'use strict';

class Matcher {

    constructor() {

        this.matchers = [];
        this.relevance = [];

    }

    add( match, fn, priority = 10 ) {

        const positive = [], negative = [], required = [];

        const wordBoundary = ( esc ) => {
            if( esc === '$' ) return '($|\\\s|\\\)|\\\.|\\\'|"|!|,|;|\\\?)';
            if( esc === '^' ) return '(^|\\\s|\\\(|\\\'|"|,|;)';
            return esc;
        };

        let i = 0, fl;

        for( ; i < match.length; i++ ) {

            fl = match[i].charAt(0);

            if( fl === '-' ) {
                negative.push( match[i].substring(1).replace( new RegExp( '^\\^|\\$$', 'g' ), wordBoundary ) );
                continue;
            }

            if( fl === '+' ) {
                required.push( match[i].substring(1).replace( new RegExp( '^\\^|\\$$', 'g' ), wordBoundary ) );
                continue;
            }

            positive.push( match[i].replace( new RegExp( '^\\^|\\$$', 'g' ), wordBoundary ) );

        }

        this.matchers.push({

            positive: positive.concat( required ),
            negative: negative,
            required: required,
            fn, fn

        });
    }

    match( string ) {

        let mostRelevance = 0, curRelevance,
            current, regexp,
            i = 0;

        for( ; i < this.matchers.length; i++ ) {

            curRelevance = 0;

            current = this.matchers[i];

            if( current.negative.length ) {

                regexp = new RegExp( current.negative.join('|'), 'i' );

                if( regexp.test( string ) ) continue;
            }

            if( current.required.length ) {

                if( ! current.required.every( ( req ) => {

                    const regexp = new RegExp( req, 'i' );

                    return regexp.test( string );

                } ) ) continue;
            }

            if( current.positive.length ) {

                regexp = new RegExp( current.positive.join('|'), 'gi' );

                const setter = ( match ) => {
                    curRelevance++;
                    return match;
                };

                string.replace( regexp, setter );

            } else {

                curRelevance = 1;

            }

            if( curRelevance > 0 && curRelevance > mostRelevance ) {
                mostRelevance = curRelevance;
                this.relevance = [ {fn: current.fn, pr: current.priority} ];
            }

            else if( curRelevance > 0 && curRelevance === mostRelevance ) {
                this.relevance.push( {fn: current.fn, pr: current.priority} );
            }

        }

        return this;
    }

    call( args, count = this.relevance.length, context = null ) {

        this.relevance.sort( ( a, b ) => a.pr - b.pr );

        for( let i = 0; i < this.relevance.length && i < count; i++ ) {

            this.relevance[i].fn.call( context, args );
        }

        this.relevance = [];
    }


};
