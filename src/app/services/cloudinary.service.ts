import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CloudinaryService {
    private cloudName = 'diknyxctr';
    private uploadPreset = 'profile_photos'; // Preset creado por el usuario

    constructor() { }

    /**
     * Sube una imagen a Cloudinary
     * @param file Archivo de imagen a subir
     * @param folder Carpeta donde guardar (opcional)
     * @returns Promise con la URL de la imagen subida
     */
    async uploadImage(file: File, folder: string = 'profile-photos'): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', folder);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Cloudinary error:', errorData);
                throw new Error(errorData.error?.message || 'Error al subir la imagen a Cloudinary');
            }

            const data = await response.json();
            return data.secure_url; // URL segura (HTTPS) de la imagen
        } catch (error: any) {
            console.error('Error uploading to Cloudinary:', error);
            throw new Error(error.message || 'Error al subir la imagen');
        }
    }

    /**
     * Genera una URL optimizada de Cloudinary
     * @param publicId ID público de la imagen en Cloudinary
     * @param transformations Transformaciones a aplicar (opcional)
     * @returns URL optimizada
     */
    getOptimizedUrl(publicId: string, transformations?: string): string {
        const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
        const transform = transformations || 'w_400,h_400,c_fill,g_face,q_auto,f_auto';
        return `${baseUrl}/${transform}/${publicId}`;
    }
}
