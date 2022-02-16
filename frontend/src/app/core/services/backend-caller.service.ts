import { Injectable } from "@angular/core";
import * as M from "../../models/templateModel";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";
import {Observable} from "rxjs";
import {Template} from "@app/models";
import {Material} from "@app/models";


@Injectable({
  providedIn: "root",
})

// -----------------------------------
// This class administrates the list of templates and executes all api calls
// -----------------------------------

export class BackendCallerService {

  templateUrl = environment.backend + environment.database + environment.template;
  materialUrl = environment.backend + environment.database + environment.material;


  constructor(private http: HttpClient) {}

  getTemplateById(id: string): Observable<Template> {
      return this.http.get<Template>(this.templateUrl + id);
  }

  // TEMPLATE API

  addTemplate(template: M.Template): Observable<{ message: string; templateId: string }> {
    return this.http.post<{ message: string; templateId: string }>(
      this.templateUrl,
      template
    );
  }

  addTemplateFromJSON(jsonData: FormData): Observable<{message: string; templateId: string }> {
    return this.http.post<{message: string; templateId: string }>(
      this.templateUrl + "json/",
      jsonData
    );
  }

  addTemplateFromExcel(postData: FormData) {
    return this.http
      .post<{ message: string; templateId: string }>(
        this.templateUrl + "excel/",
        postData
      );
  }

  deleteTemplate(id: string) {
    return this.http.delete(this.templateUrl + id);
  }

  updateTemplate(template: M.Template) {
    return this.http
      .put(this.templateUrl + template._id, {
        parts: template.parts,
        name: template.name,
      });
  }

  getTemplateList(): Observable<Template[]> {
    return this.http.get<Template[]>(this.templateUrl);
  }

  // MATERIAL API

  addMaterial(formData: FormData): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      this.materialUrl + "add/",
      formData
    );
  }

  updateMaterial(material: Material) {
    return this.http.put<{message: string}>(this.materialUrl + "update/" + material._id, {
      template: material.template,
      coordinates: material.annotations,
      judged: true
    });
  }

  deleteMaterial(objectID: string, scanID: string): Observable<{ message: string }> {
    return this.http.post<{message: string}>(this.materialUrl + "delete/",
      {objectID, scanID});
  }

  getMaterialById(id: string) {
    return this.http.get<{message: string; material: Material}>(this.materialUrl + "get/" + id);
  }

  listByQuery(skip: number, length: number, judged: boolean, pathology="") {
    const query = {skip, length, judged, pathology};
    // skip: mongoose skip parameter, how many documents to skip
    // length: how many documents to return
    return this.http.post<{message: string; materials: Material[]}>(
      this.materialUrl + "listByQuery/",
      query);
  }

  getRandom(judged: boolean, pathology = "") {
    const query = {judged, pathology};
    return this.http.post<{message: string; material: Material}>(
      this.materialUrl + "random/",
      query
    );
  }

  getDocCount(judged: boolean, pathology: string = "") {
    const query = {judged, pathology};
    return this.http.post<{message: string, count: number}>(
      this.materialUrl + "queryDocCount/",
      query
    );
  }

}


