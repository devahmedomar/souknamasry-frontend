import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-skeleton.html',
  styleUrl: './profile-skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSkeleton {
  /** Type of skeleton: 'sidebar' | 'profile' | 'form' */
  type = input<'sidebar' | 'profile' | 'form'>('profile');
}
