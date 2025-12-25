import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Category } from '../../../shared/models/category.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CategoriesService {
    private http = inject(HttpClient);

    getCategoryByPath(path: string): Observable<Category> {
        if (!path) {
            return this.http.get<{ status: string, data: { categories: Category[] } }>(`${environment.apiUrl}categories/root`).pipe(
                map(res => ({
                    _id: 'root',
                    name: 'All Categories',
                    nameAr: 'جميع الفئات',
                    slug: '',
                    path: '',
                    isLeaf: false,
                    children: res.data.categories.map(c => ({
                        ...c,
                        path: c.path || c.slug
                    })),
                    breadcrumb: []
                } as Category))
            );
        }
        return this.http.get<{
            status: string,
            data: {
                category: Category,
                children: Category[],
                breadcrumb: { _id: string, name: string, slug: string }[],
                isLeaf: boolean
            }
        }>(`${environment.apiUrl}categories/path/${path}`).pipe(
            map(res => {
                const category = {
                    ...res.data.category,
                    path: res.data.category.path || path
                };
                const children = res.data.children.map(child => ({
                    ...child,
                    path: child.path || (category.path ? `${category.path}/${child.slug}` : child.slug)
                }));
                return {
                    ...category,
                    isLeaf: res.data.isLeaf, // Ensure isLeaf is mapped correctly
                    children,
                    breadcrumb: res.data.breadcrumb
                };
            })
        );
    }
}
