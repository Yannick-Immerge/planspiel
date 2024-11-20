CREATE TABLE RoleTable(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(500)
);

CREATE TABLE RoleEntryTable(
    id INT AUTO_INCREMENT PRIMARY KEY,
    describes INT,
    type VARCHAR(100),
    text_content VARCHAR(1000),
    binary_content LONGBLOB,
    FOREIGN KEY (describes) REFERENCES RoleTable(id)
);

CREATE TABLE ScenarioTable(
    id INT AUTO_INCREMENT PRIMARY KEY,
    belongs_to INT,
    type VARCHAR(100),
    text_content VARCHAR(1000),
    binary_content LONGBLOB,
    FOREIGN KEY (belongs_to) REFERENCES RoleTable(id)
);

CREATE TABLE AttributeTable(
    id INT AUTO_INCREMENT PRIMARY KEY,
    simple_name VARCHAR(100),
    en_roads_name VARCHAR(100),
    description VARCHAR(500),
    icon LONGBLOB
);

CREATE TABLE ScenarioConditionTable(
    id INT AUTO_INCREMENT PRIMARY KEY,
    attribute INT,
    min_value FLOAT,
    max_value FLOAT,
    FOREIGN KEY (attribute) REFERENCES AttributeTable(id)
);

CREATE TABLE RequireTable(
    cond_id INT,
    scenario_id INT,
    FOREIGN KEY (cond_id) REFERENCES ScenarioConditionTable(id),
    FOREIGN KEY (scenario_id) REFERENCES ScenarioTable(id),
    PRIMARY KEY (cond_id, scenario_id)
);

CREATE TABLE GameStateTable(
    id INT AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE AdministratorTable(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    contact VARCHAR(100),
    username VARCHAR(100),
    pswrd_hash VARCHAR(100)
);

CREATE TABLE GameTable(
    id INT AUTO_INCREMENT PRIMARY KEY,
    state INT,
    admin INT,
    FOREIGN KEY (state) REFERENCES GameStateTable(id),
    FOREIGN KEY (admin) REFERENCES AdministratorTable(id)
);

CREATE TABLE PlayerTable(
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_of INT,
    plays_as INT,
    name VARCHAR(100),
    username VARCHAR(100),
    pswrd_hash VARCHAR(100),
    FOREIGN KEY (member_of) REFERENCES GameTable(id),
    FOREIGN KEY (plays_as) REFERENCES RoleTable(id)
);