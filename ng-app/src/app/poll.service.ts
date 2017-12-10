import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { Poll } from './poll';
import { Ballot } from './ballot';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PollService {

  private apiOrigin = environment.apiOrigin;

  constructor(private http : HttpClient) { }

  upsertPoll(poll: Poll) : Observable<any> {
    return this.http.post<any>(`${this.apiOrigin}/createPoll`, poll, httpOptions).pipe(
      tap(() => console.log(`added poll`)),
      catchError(this.handleError<any>('addPoll'))
    );
  }

  getPoll(id: number, token: string) : Observable<any> {
    let url = `${this.apiOrigin}/poll/${id}?token=${token}`;
    return this.http.get<Poll>(url).pipe(
      tap(_ => console.log(`fetched poll id=${id}`)),
      catchError(this.handleError<Poll>(`getPoll id=${id}`))
    );
  }

  getBallot(id: number, token: string) : Observable<any> {
    let url = `${this.apiOrigin}/ballot/${id}?token=${token}`;
    return this.http.get<Ballot>(url).pipe(
      tap(_ => console.log(`fetched ballot id=${id}`)),
      catchError(this.handleError<Ballot>(`getPoll id=${id}`))
    );
  }

  upsertBallotChoices(id: number, order: number[], token: string) : Observable<any> {
    let url = `${this.apiOrigin}/ballot/${id}?token=${token}`;
    return this.http.post<any>(url, {order: order}, httpOptions).pipe(
      tap(() => console.log(`upserted ballot choices`)),
      catchError(this.handleError<any>('upsertBallotChoices'))
    );
  }

  closePoll(id: number, token: string) : Observable<any> {
    return this.http.post<any>(`${this.apiOrigin}/closePoll/${id}?token=${token}`, httpOptions).pipe(
      tap(() => console.log(`closed poll`)),
      catchError(this.handleError<any>('addPoll'))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
