CREATE TABLE GameState(
    id INT AUTO_INCREMENT PRIMARY KEY,
    phase VARCHAR(100) NOT NULL
);

CREATE TABLE Parameter(
    simple_name VARCHAR(100) PRIMARY KEY,
    description VARCHAR(500) NOT NULL,
    min_value FLOAT NOT NULL,
    max_value FLOAT NOT NULL
);

CREATE TABLE controls(
    game_state INT,
    parameter VARCHAR(100),
    buergerrat INT,
    choice FLOAT NULL,
    FOREIGN KEY (game_state) REFERENCES GameState(id),
    FOREIGN KEY (parameter) REFERENCES Parameter(simple_name),
    PRIMARY KEY (game_state, parameter, buergerrat)
);

CREATE TABLE ProductKey(
    key_value VARCHAR(100) PRIMARY KEY,
    num_sessions INT NOT NULL,
    expires DATETIME
);

CREATE TABLE Session(
    session_id VARCHAR(100) PRIMARY KEY,
    product_key VARCHAR(100) NOT NULL,
    administrator VARCHAR(100) NOT NULL,
    game_state INT NOT NULL,
    session_status VARCHAR(100) NOT NULL,
    FOREIGN KEY (product_key) REFERENCES ProductKey(key_value),
    FOREIGN KEY (game_state) REFERENCES GameState(id)
);

CREATE TABLE RoleTable(
    name VARCHAR(100) PRIMARY KEY,
    description VARCHAR(500) NOT NULL
);

CREATE TABLE User(
    username VARCHAR(100) PRIMARY KEY,
    member_of VARCHAR(100) NOT NULL,
    plays_as VARCHAR(100) NULL,
    password_hash VARCHAR(500) NULL,
    buergerrat INT NULL,
    FOREIGN KEY (member_of) REFERENCES Session(session_id),
    FOREIGN KEY (plays_as) REFERENCES RoleTable(name)
);

CREATE TABLE Metric(
    simple_name VARCHAR(100) PRIMARY KEY,
    description VARCHAR(500) NOT NULL,
    min_value FLOAT NOT NULL,
    max_value FLOAT NOT NULL
);

CREATE TABLE ScenarioCondition(
    name VARCHAR(100) PRIMARY KEY,
    metric VARCHAR(100) NOT NULL,
    min_value FLOAT NULL,
    max_value FLOAT NULL,
    FOREIGN KEY (metric) REFERENCES Metric(simple_name)
);

CREATE TABLE Resource(
    identifier VARCHAR(100) PRIMARY KEY,
    content_type VARCHAR(100) NOT NULL
);

CREATE TABLE Scenario(
    name VARCHAR(100) PRIMARY KEY,
    belongs_to VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    FOREIGN KEY (belongs_to) REFERENCES RoleTable(name),
    FOREIGN KEY (resource) REFERENCES Resource(identifier)
);

CREATE TABLE depends_on(
    scenario VARCHAR(100),
    scenario_condition VARCHAR(100),
    FOREIGN KEY (scenario) REFERENCES Scenario(name),
    FOREIGN KEY (scenario_condition) REFERENCES ScenarioCondition(name),
    PRIMARY KEY (scenario, scenario_condition)
);

CREATE TABLE RoleEntry(
    name VARCHAR(100) PRIMARY KEY,
    belongs_to VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    FOREIGN KEY (belongs_to) REFERENCES RoleTable(name),
    FOREIGN KEY (resource) REFERENCES Resource(identifier)
);

CREATE TABLE Projection(
    game_state INT NOT NULL,
    metric VARCHAR(100) NOT NULL,
    projected_value FLOAT NULL,
    FOREIGN KEY (game_state) REFERENCES GameState(id),
    FOREIGN KEY (metric) REFERENCES Metric(simple_name),
    PRIMARY KEY (game_state, metric)
);

CREATE TABLE Voting(
    user VARCHAR(100) NOT NULL,
    parameter VARCHAR(100) NOT NULL,
    voted_value FLOAT NULL,
    FOREIGN KEY (user) REFERENCES User(username),
    FOREIGN KEY (parameter) REFERENCES Parameter(simple_name),
    PRIMARY KEY (user, parameter)
);

