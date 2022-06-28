INSERT INTO public.departement (id, nom, numero) (
  select nouv_numero::integer, nouv_nom, nouv_numero 
    from (select 'Québec' nouv_nom, '1000' nouv_numero
         ) nouv
   where not exists (select 1 from public.departement where id=nouv_numero::integer)
);

INSERT INTO public."ZUPC" (id,departement_id,nom,insee,parent_id,active) (
  select nouv_numero::integer, nouv_numero::integer, nouv_nom, nouv_numero, nouv_numero::integer, true
    from (select 'Québec' nouv_nom, '1000' nouv_numero
         ) nouv
   where not exists (select 1 from public."ZUPC" where id=nouv_numero::integer)
);
