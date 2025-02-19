import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol.model';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  pathName: string = 'cat_roles';

  constructor(private firestore: Firestore) {}

  get(): Observable<Rol[] | any> {
    const usersCollection = collection(this.firestore, this.pathName);
    return collectionData(usersCollection, { idField: 'id' });
  }
}
