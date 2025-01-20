import { Sucursal } from "./Sucursal";

export interface Usuario 
{
    nombre:string;
    apellidoP:string;
    apellidoM:string;
    idRol:string;
    email:string;
    password:string;  
    uid:string; 
    sucursales:Sucursal[]; 
 }

 export interface UsuarioDB 
{
    id:string
    nombre:string;
    apellidoP:string;
    apellidoM:string;
    idRol:string;
    email:string;
    password:string;
    uid:string;  
    sucursales:Sucursal[]; 
 }

 export interface UsuarioLogin 
{
    id:string
    nombre:string;
    apellidoP:string;
    apellidoM:string;
    idRol:string;
    email:string;
    uid:string;  
    sucursales:Sucursal[]; 
 }
