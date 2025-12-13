import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { CloudinaryService } from '../services/cloudinary.service';

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
    private cloudinaryService = inject(CloudinaryService);

    currentUser: User | null = null;
    profileForm!: FormGroup;
    loading = false;
    successMessage = '';
    errorMessage = '';

    // Photo upload properties
    selectedFile: File | null = null;
    photoPreview: string | null = null;
    uploadProgress: number = 0;
    uploading = false;

    ngOnInit() {
        this.initializeForm();
        // Wait for Firebase Auth to initialize before loading user data
        this.authService.auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('🔐 Auth state changed, user authenticated:', user.uid);
                this.loadUserData();
            } else {
                console.log('🚫 No authenticated user, redirecting to login');
                this.router.navigate(['/login']);
            }
        });
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
        console.log('🔍 Loading user data...');
        const authUser = this.authService.getCurrentUser();

        if (!authUser) {
            console.error('❌ No authenticated user found');
            return;
        }

        console.log('📡 Fetching user data from Firestore for UID:', authUser.uid);
        this.userService.getUserById(authUser.uid).subscribe({
            next: (user) => {
                console.log('✅ User data received:', user);
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
                    console.log('📝 Form patched with user data');
                } else {
                    console.warn('⚠️ User data is null');
                    this.errorMessage = 'No se encontraron datos de usuario. Por favor, completa tu perfil.';
                }
            },
            error: (error) => {
                console.error('❌ Error loading user data:', error);
                this.errorMessage = 'Error al cargar los datos del perfil: ' + error.message;
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

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.errorMessage = 'Por favor selecciona una imagen válida';
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.errorMessage = 'La imagen no debe superar 5MB';
                return;
            }

            this.selectedFile = file;

            // Create preview
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.photoPreview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    async uploadPhoto() {
        if (!this.selectedFile || !this.currentUser) {
            return;
        }

        this.uploading = true;
        this.uploadProgress = 0;
        this.errorMessage = '';

        try {
            console.log('📤 Subiendo foto a Cloudinary...');

            // Simular progreso mientras se sube
            this.uploadProgress = 30;

            // Subir a Cloudinary
            const photoURL = await this.cloudinaryService.uploadImage(
                this.selectedFile,
                `profile-photos/${this.currentUser.uid}`
            );

            console.log('✅ Foto subida exitosamente:', photoURL);
            this.uploadProgress = 70;

            // Actualizar perfil de usuario con la URL de la foto
            await this.userService.updateUserProfile(this.currentUser.uid, {
                photoURL: photoURL
            });

            console.log('✅ Perfil actualizado en Firestore');
            this.uploadProgress = 100;

            // Actualizar objeto local
            this.currentUser.photoURL = photoURL;

            this.uploading = false;
            this.selectedFile = null;
            this.successMessage = '✅ Foto de perfil actualizada';

            setTimeout(() => {
                this.successMessage = '';
                this.photoPreview = null;
            }, 2000);

        } catch (error: any) {
            console.error('❌ Error al subir la foto:', error);
            this.errorMessage = 'Error al subir la foto: ' + (error.message || 'Intenta de nuevo');
            this.uploading = false;
            this.uploadProgress = 0;
        }
    }

    removePhoto() {
        this.selectedFile = null;
        this.photoPreview = null;
        this.uploadProgress = 0;
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }
}
