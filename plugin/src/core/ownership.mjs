
import { DatabaseSync } from 'node:sqlite';
import { chmodSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
/** Kernel-backed SQLite lock: released even when the host process crashes. */
export class InstanceLease {
 constructor(path){
  mkdirSync(dirname(path),{recursive:true,mode:0o700});
  let db;
  try{
   db=new DatabaseSync(path);db.exec('PRAGMA busy_timeout=0; PRAGMA journal_mode=DELETE; CREATE TABLE IF NOT EXISTS owner (pid INTEGER, started TEXT); BEGIN EXCLUSIVE;');
   db.prepare('INSERT INTO owner(pid,started) VALUES (?,?)').run(process.pid,new Date().toISOString());
   chmodSync(path,0o600);this.db=db;
  }catch(cause){db?.close();throw Object.assign(new Error('Prediction storage is already owned or cannot be locked',{cause}),{code:'STORAGE_OWNED'})}
 }
 close(){if(!this.db)return;const db=this.db;this.db=null;try{db.exec('ROLLBACK')}finally{db.close()}}
}
