import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Configuración de Firebase (tomada de src/environments/environment.ts)
const firebaseConfig = {
    apiKey: "AIzaSyDA1lbEvt7w2-PKk2NCreHrgc2JQJL53LQ",
    authDomain: "control-pagos-9baed.firebaseapp.com",
    projectId: "control-pagos-9baed",
    storageBucket: "control-pagos-9baed.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // Completa este valor si lo tienes
    appId: "YOUR_APP_ID"  // Completa este valor si lo tienes
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migratePagos() {
    console.log('🔄 Iniciando migración de pagos...');

    try {
        // Obtener todos los documentos de la colección 'pagos'
        const pagosRef = collection(db, 'pagos');
        const snapshot = await getDocs(pagosRef);

        console.log(`📊 Total de pagos encontrados: ${snapshot.size}`);

        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        // Procesar cada documento
        for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            const pagoId = docSnapshot.id;

            // Verificar si tiene 'usuarioId' pero no 'userId'
            if (data.usuarioId && !data.userId) {
                try {
                    const pagoDocRef = doc(db, 'pagos', pagoId);

                    // Actualizar el documento: agregar 'userId' con el valor de 'usuarioId'
                    await updateDoc(pagoDocRef, {
                        userId: data.usuarioId
                    });

                    console.log(`✅ Migrado pago ${pagoId}: usuarioId -> userId`);
                    migratedCount++;
                } catch (error) {
                    console.error(`❌ Error migrando pago ${pagoId}:`, error);
                    errorCount++;
                }
            } else if (data.userId) {
                console.log(`⏭️  Pago ${pagoId} ya tiene 'userId', omitiendo...`);
                skippedCount++;
            } else {
                console.warn(`⚠️  Pago ${pagoId} no tiene ni 'usuarioId' ni 'userId'`);
                skippedCount++;
            }
        }

        console.log('\n📈 Resumen de migración:');
        console.log(`   ✅ Migrados: ${migratedCount}`);
        console.log(`   ⏭️  Omitidos: ${skippedCount}`);
        console.log(`   ❌ Errores: ${errorCount}`);
        console.log(`   📊 Total: ${snapshot.size}`);

        if (migratedCount > 0) {
            console.log('\n✨ Migración completada exitosamente!');
            console.log('💡 Ahora los clientes deberían poder ver sus pagos en el dashboard.');
        } else {
            console.log('\n✨ No se encontraron pagos para migrar.');
        }

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    }
}

// Ejecutar migración
migratePagos()
    .then(() => {
        console.log('\n🏁 Script de migración finalizado.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
