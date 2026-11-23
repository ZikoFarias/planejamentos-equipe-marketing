export function taskTypeMigrationSql(current,next,revision){
 const patches={};for(let i=0;i<current.length;i++){const patch=Object.fromEntries(Object.entries(next[i]).filter(([key,value])=>JSON.stringify(value)!==JSON.stringify(current[i][key])));if(Object.keys(patch).length)patches[current[i].id]=patch}
 const payload=JSON.stringify(patches).replaceAll("'","''");
 let expression="json_set(original,'$.taskType',coalesce(json_extract(patch,'$.taskType'),json_extract(original,'$.taskType')),'$.tags',json(coalesce(json_extract(patch,'$.tags'),json_extract(original,'$.tags'))))";
 expression="CASE WHEN json_type(patch,'$.externalArtwork') IS NOT NULL THEN json_set("+expression+",'$.externalArtwork',json(CASE WHEN json_extract(patch,'$.externalArtwork') THEN 'true' ELSE 'false' END)) ELSE "+expression+" END";
 expression="CASE WHEN json_type(patch,'$.purchase') IS NOT NULL THEN json_set("+expression+",'$.purchase',json_extract(patch,'$.purchase')) ELSE "+expression+" END";
 const sql="UPDATE marketing_board SET data=(SELECT json_group_array(json(CASE WHEN patch IS NULL THEN original ELSE "+expression+" END)) FROM (SELECT value AS original,json_extract('"+payload+"','$.'||json_quote(json_extract(value,'$.id'))) AS patch FROM json_each(marketing_board.data) ORDER BY CAST(key AS INTEGER))),revision=revision+1 WHERE id=1 AND revision="+revision+";";
 if(Buffer.byteLength(sql)>95000)throw Error('Plano de migração muito grande. Nenhum cartão foi alterado.');
 return sql;
}
