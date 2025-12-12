import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    private authService = inject(AuthService);
    private userService = inject(UserService);
    private fb = inject(FormBuilder);
    private router = inject(Router);

    currentUser: User | null = null;
    profileForm!: FormGroup;
    loading = false;
    successMessage = '';
    errorMessage = '';

    ngOnInit() {
        this.initializeForm();
        this.loadUserData();
    }

    initializeForm() {
        this.profileForm = this.fb.group({
            displayName: [''],
            dni: [''],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            phone: [''],
            address: [''],
            email: [{ value: '', disabled: true }]
        });
    }

    loadUserData() {
        const authUser = this.authService.getCurrentUser();
        if (!authUser) {
            this.router.navigate(['/login']);
            return;
        }

        this.userService.getUserById(authUser.uid).subscribe(user => {
            if (user) {
                this.currentUser = user;
                this.profileForm.patchValue({
                    displayName: user.displayName || '',
                    dni: user.dni || '',
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    phone: user.phone || '',
                    address: user.address || '',
                    email: user.email
                });
            }
        });
    }

    async onSubmit() {
        if (this.profileForm.invalid || !this.currentUser) {
            return;
        }

        this.loading = true;
        this.successMessage = '';
        this.errorMessage = '';

        try {
            const formData = this.profileForm.getRawValue();
            await this.userService.updateUserProfile(this.currentUser.uid, {
                displayName: formData.displayName,
                dni: formData.dni,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                address: formData.address
            });

            this.successMessage = '✅ Perfil actualizado correctamente';
            setTimeout(() => {
                this.successMessage = '';
            }, 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            this.errorMessage = '❌ Error al actualizar el perfil';
        } finally {
            this.loading = false;
        }
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }
}
