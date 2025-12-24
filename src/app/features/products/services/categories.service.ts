import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Category } from '../../../shared/models/category.interface';

@Injectable({
    providedIn: 'root',
})
export class CategoriesService {
    private http = inject(HttpClient);
    private apiUrl = 'https://souknamasry-be.vercel.app/api/categories';

    getCategoryByPath(path: string): Observable<Category> {
        if (!path) {
            return this.http.get<{ status: string, data: { categories: Category[] } }>(`${this.apiUrl}/root`).pipe(
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
        }>(`${this.apiUrl}/path/${path}`).pipe(
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
