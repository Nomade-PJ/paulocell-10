/**
 * Serviço de Armazenamento com Supabase Storage
 * 
 * Este serviço fornece métodos para upload, download e gerenciamento de arquivos
 * utilizando o Supabase Storage.
 */

import supabase from '../lib/supabase';

// Configuração dos buckets por tipo de arquivo
const BUCKETS = {
  PROFILE_IMAGES: 'profile-images',
  PRODUCT_IMAGES: 'product-images',
  DOCUMENTS: 'documents',
  TEMP: 'temp'
};

// Configuração de tipos de arquivos permitidos
const ALLOWED_MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  all: ['*']
};

// Tamanho máximo de arquivo (em bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

class StorageService {
  /**
   * Faz upload de um arquivo
   * @param {File} file Arquivo a ser enviado
   * @param {string} bucket Nome do bucket (pasta)
   * @param {string} path Caminho dentro do bucket
   * @param {Object} options Opções adicionais
   * @returns {Promise<Object>} Dados do arquivo enviado
   */
  async uploadFile(file, bucket = BUCKETS.TEMP, path = '', options = {}) {
    try {
      // Validar tamanho do arquivo
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }
      
      // Validar tipo do arquivo
      const allowedTypes = options.allowedTypes || ALLOWED_MIME_TYPES.all;
      if (allowedTypes !== ALLOWED_MIME_TYPES.all && !allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de arquivo não permitido: ${file.type}`);
      }
      
      // Gerar caminho completo
      const fileName = options.fileName || `${Date.now()}_${file.name}`;
      const filePath = path ? `${path}/${fileName}` : fileName;
      
      // Fazer upload
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: options.cacheControl || '3600',
          upsert: options.upsert || false,
          contentType: file.type
        });
      
      if (error) throw error;
      
      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      return {
        path: filePath,
        fullPath: data.path,
        bucket,
        publicUrl: urlData.publicUrl,
        contentType: file.type,
        size: file.size
      };
    } catch (error) {
      console.error('Erro ao fazer upload de arquivo:', error);
      throw error;
    }
  }
  
  /**
   * Faz download de um arquivo
   * @param {string} path Caminho do arquivo
   * @param {string} bucket Nome do bucket
   * @returns {Promise<Blob>} Arquivo para download
   */
  async downloadFile(path, bucket = BUCKETS.TEMP) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      throw error;
    }
  }
  
  /**
   * Remove um arquivo
   * @param {string} path Caminho do arquivo
   * @param {string} bucket Nome do bucket
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async deleteFile(path, bucket = BUCKETS.TEMP) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      throw error;
    }
  }
  
  /**
   * Lista arquivos em um bucket
   * @param {string} bucket Nome do bucket
   * @param {string} path Caminho dentro do bucket
   * @returns {Promise<Array>} Lista de arquivos
   */
  async listFiles(bucket = BUCKETS.TEMP, path = '') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw error;
    }
  }
  
  /**
   * Obtém URL pública de um arquivo
   * @param {string} path Caminho do arquivo
   * @param {string} bucket Nome do bucket
   * @returns {string} URL pública
   */
  getPublicUrl(path, bucket = BUCKETS.TEMP) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
  
  /**
   * Obtém URL de download temporária
   * @param {string} path Caminho do arquivo
   * @param {string} bucket Nome do bucket
   * @param {number} expiresIn Tempo de expiração em segundos
   * @returns {Promise<string>} URL temporária
   */
  async getSignedUrl(path, bucket = BUCKETS.TEMP, expiresIn = 60) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);
      
      if (error) throw error;
      
      return data.signedUrl;
    } catch (error) {
      console.error('Erro ao gerar URL assinada:', error);
      throw error;
    }
  }
  
  /**
   * Move um arquivo entre buckets ou caminhos
   * @param {string} fromPath Caminho de origem
   * @param {string} toPath Caminho de destino
   * @param {string} fromBucket Bucket de origem
   * @param {string} toBucket Bucket de destino
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async moveFile(fromPath, toPath, fromBucket = BUCKETS.TEMP, toBucket = fromBucket) {
    try {
      // Primeiro fazer download do arquivo
      const fileData = await this.downloadFile(fromPath, fromBucket);
      
      // Converter Blob para File
      const file = new File([fileData], fromPath.split('/').pop(), {
        type: fileData.type
      });
      
      // Upload para novo local
      await this.uploadFile(file, toBucket, toPath.split('/').slice(0, -1).join('/'), {
        fileName: toPath.split('/').pop(),
        upsert: true
      });
      
      // Excluir arquivo original
      await this.deleteFile(fromPath, fromBucket);
      
      return true;
    } catch (error) {
      console.error('Erro ao mover arquivo:', error);
      throw error;
    }
  }
}

// Exportar instância única do serviço e constantes
const storageService = new StorageService();

export { storageService as default, BUCKETS, ALLOWED_MIME_TYPES }; 