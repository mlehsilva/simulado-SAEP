# simulado-SAEP

>docker run -d --name autofix_db_data -p 3306:3306 -e MYSQL_ROOT_PASSWORD=autofix@2023 -e MYSQL_DATABASE=autofix mysql:8.0

use autofix;

-- 1. Tabela de Usuários (para o Login)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

-- 2. Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100)
);

-- 3. Tabela de Veículos
CREATE TABLE IF NOT EXISTS veiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) NOT NULL UNIQUE,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    ano INT NOT NULL,
    cliente_id INT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- 4. Tabela de Ordens de Serviço (OS)
CREATE TABLE IF NOT EXISTS ordens_servico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao_problema TEXT NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cliente_id INT NOT NULL,
    veiculo_id INT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE
);

INSERT INTO usuarios (nome, email, senha) VALUES 

('Carlos Admin', 'admin@autofix.com', '$2a$10$7R6v74u3p3CymYmS6A3Rie6Xm1H68H9m1QO3H2n8B5h3V4Rz2Z9m.'),

('Rodrigo Mecanico', 'mecanico@autofix.com', '$2a$10$N9vWqXvT97R8XzY5K3O1e.A5eK7N3QO4H2n8B5h3V4Rz2Z9m6K6G.'),

('Ana Atendente', 'atendente@autofix.com', '$2a$10$L2vMvXvT97R8XzY5K3O1e.E5eK7N3QO4H2n8B5h3V4Rz2Z9m6K6G.');

USE autofix;

ALTER TABLE ordens_servico 
ADD COLUMN situacao ENUM('Não Iniciado', 'Em Andamento', 'Concluído') DEFAULT 'Não Iniciado';

