COMMAND -> 	(NAVIGATE_COMMAND | 
			TAKE_COMMAND |
			PUT_COMMAND |
			SINGLE_COMMAND |
			SIMPLE_COMMAND |
			USE_COMMAND ) {%id%}

NAVIGATE_COMMAND -> VERB_NAVIGATE _ DIRECTION {% function(d){ return {verb:d[0], direction:d[2]} } %}

SINGLE_COMMAND -> VERB_SINGLE {% function(d){ return {verb:d[0][0]}} %}

TAKE_COMMAND -> VERB_TAKE _ OBJ {%function(d){return {verb:d[0], obj:d[2]}}%}

PUT_COMMAND -> VERB_PUT _ OBJ _ PUT_PREPOSITION _ OBJ {%function(d){return {verb: d[0],
																			  obj: d[2],
																			 subject:d[6]}}%}

SIMPLE_COMMAND -> VERB_SIMPLE _ OBJ {% function(d){return{verb:d[0][0], obj:d[2]}} %}

USE_COMMAND -> VERB_USE _ OBJ {%function(d){return {verb:d[0], obj:d[2]}}%}|
				VERB_USE _ OBJ _ USE_PREPOSITION _ OBJ  {%function(d){return {verb: d[0],
																			  obj: d[2],
																			 subject:d[6]}}%}
# Synonyms
VERB_MOVE -> ("move"|"push"|"pull") {%(d)=>"move"%}
VERB_NAVIGATE -> ("go" | "walk") {%function(d){return "go"}%}
VERB_EXAMINE -> ("look at"|"examine") {%function(d){return "examine"}%}
VERB_TOUCH -> ("touch"|"feel") {%function(d){return "touch"}%}
VERB_TAKE -> ("take"|"collect"|"pick up")  {%function(d){return "take"}%}
VERB_PUT -> ("place"|"insert"|"put")  {%function(d){return "place"}%}

VERB_SIMPLE ->  (VERB_MOVE | VERB_EXAMINE | VERB_TOUCH | "open" | "close"){%id%}


VERB_SINGLE ->  ("help"|"look") {%id%}
VERB_USE -> "use" {%id%}

DIRECTION -> _object {%id%}  #("north"|"south"|"west"|"east"|"n"|"s"|"w"|"e"|[a-zA-Z]:+) {%function(d){ return d[0][0]; }%}

PUT_PREPOSITION -> ("inside"|"in"|"into"|"in to"|"in side"){%id%}
CONTAINMENT_PREPOSITION -> ("inside"|"in"|"in side"|"from"|"of"){%id%}
USE_PREPOSITION -> ("with"|"on"){%id%}
 
OBJ -> _object {% (d,i,r)=>{return {obj:d[0], container:'ambient'}}  %}  | _containedObject {%id%}
_object -> [a-zA-Z_] {% id %}
	| _object [a-zA-Z_] {% function(d) {return d[0] + d[1] } %}
	
_containedObject-> _object _ CONTAINMENT_PREPOSITION _ _object {% (d,i,r)=>{return {obj:d[0], container:d[4]}}  %} 

_ -> [ ]:+ 