ace.define("ace/snippets/gsl",["require","exports","module"], function(require, exports, module) {
"use strict";

exports.snippetText = "# Prototype\n\
snippet g\n\
	g${1:GENE}\n\
\n\
snippet p\n\
	p${1:GENE}\n\
\n\
snippet promoter\n\
	p${1:GENE}\n\
\n\
snippet t\n\
	t${1:GENE}\n\
\n\
snippet u\n\
	u${1:GENE}\n\
\n\
snippet d\n\
	d${1:GENE}\n\
\n\
snippet o\n\
	o${1:GENE} \n\
\n\
snippet f\n\
	f${1:GENE} \n\
\n\
snippet m\n\
	m${1:GENE} \n\
\n\
# Declare variable\n\
snippet var\n\
	let ${1:variable_name} = ${2:identifier}\n\
# Function\n\
snippet func\n\
	let ${1?:function_name}(${2:argument}) =\n\
		${3:// body...}\n\
	end\n\
# Simple slice\n\
snippet sl\n\
	g${1:GENE}[${2:Basepair}:${3:Basepair}]\n\
# Relative slice start\n\
snippet sl_relative\n\
	g${1:GENE}[${2:Basepair}S:${3:Basepair}E]\n\
# Relative slice start\n\
snippet sl_start\n\
	g${1:GENE}[${2:Basepair}S:${3:Basepair}]\n\
# Relative slice end\n\
snippet sl_end\n\
	g${1:GENE}[${2:Basepair}:${3:Basepair}E]\n\
# Protein slice\n\
snippet sl_protein\n\
	g${1:GENE}[${2:Aminoacid}a:${3:Aminoacid}a]\n\
# Approx slice \n\
snippet sl_appr\n\
	g${1:GENE}[~${2:Basepair}:~${3:Basepair}]\n\
# Delete locus\n\
snippet del\n\
	g${1:GENE}^\n\
# docstring\n\
snippet (**\n\
	(**\n\
	 * ${1:description}\n\
	 *\n\
	 *)\n\
# for \n\
snippet for\n\
	for ${1:i} in ${2:list} do\n\
		${3://body...}\n\
	end\n\
\n\
\n\
snippet name\n\
	\#name ${0/.*\\/()/\\u$0/}${1:ConstructName} \n\
	$0\n\
";
exports.scope = 'gsl';
});
