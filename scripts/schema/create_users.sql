CREATE USER 'data_controller_user'@'%' IDENTIFIED BY 'admin';
CREATE USER 'game_controller_user'@'%' IDENTIFIED BY 'admin';

GRANT ALL PRIVILEGES ON mydatabase.* TO 'data_controller_user'@'%';

GRANT ALL PRIVILEGES ON mydatabase.* TO 'game_controller_user'@'%';

FLUSH PRIVILEGES;