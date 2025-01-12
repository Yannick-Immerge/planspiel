from shared.data_model.context import execute, Query


class DataManager:

    def has_role(self, name: str) -> bool:
        query = "SELECT COUNT(*) FROM RoleTable WHERE name = %s;"
        n = execute(Query(query, (name,)))[0][0]
        return n > 0

    def has_parameter(self, simple_name: str) -> bool:
        query = f"SELECT COUNT(*) FROM Parameter WHERE simple_name = %s;"
        n = execute(Query(query, (simple_name,)))[0][0]
        return n > 0

    def has_metric(self, simple_name: str) -> bool:
        query = f"SELECT COUNT(*) FROM Metric WHERE simple_name = %s;"
        n = execute(Query(query, (simple_name,)))[0][0]
        return n > 0

    def list_roles(self):
        query = "SELECT name FROM RoleTable;"
        return {
            "names": [row[0] for row in execute(Query(query, ()))]
        }

    def get_facts(self, name: str) -> list[dict]:
        query = f"SELECT name, text_identifier, hyperlink, is_scenario FROM Fact WHERE belongs_to = %s;"
        facts = []
        for fact_name, text_identifier, hyperlink, is_scenario in execute(Query(query, (name,))):
            facts.append({
                "name": fact_name,
                "textIdentifier": text_identifier,
                "hyperlink": hyperlink,
                "isScenario": is_scenario
            })
        return facts

    def get_posts(self, name: str) -> list[dict]:
        query = (f"SELECT name, type, author, text_de_identifier, text_orig_identifier, is_scenario FROM Post "
                 f"WHERE belongs_to = %s;")
        posts = []
        for post_name, type, author, text_de_identifier, text_orig_identifier, is_scenario in execute(Query(query, (name,))):
            image_query = f"SELECT image_identifier FROM PostImage WHERE post = %s"
            image_identifiers = [row[0] for row in execute(Query(image_query, (post_name,)))]
            posts.append({
                "name": post_name,
                "textDeIdentifier": text_de_identifier,
                "textOrigIdentifier": text_orig_identifier,
                "type": type,
                "author": author,
                "imageIdentifiers": image_identifiers,
                "isScenario": is_scenario
            })
        return posts

    def get_role(self, name: str) -> dict:
        if not self.has_role(name):
            raise NameError(f"There exists no role with the name {name}.")
        query = (f"SELECT meta_name, meta_gender, meta_birthday, meta_living, meta_status, meta_language, meta_flag, "
                 f"meta_job, profile_picture_identifier, "
                 f"profile_picture_old_identifier, titlecard_identifier, info_identifier FROM RoleTable "
                 f"WHERE name = %s;")
        row = execute(Query(query, (name,)))[0]
        metadata = {
            "name": row[0],
            "gender": row[1],
            "birthday": row[2],
            "living": row[3],
            "status": row[4],
            "language": row[5],
            "flag": row[6],
            "job": row[7]
        }
        role_data = {
            "metadata": metadata,
            "profilePictureIdentifier": row[8],
            "profilePictureOldIdentifier": row[9],
            "titlecardIdentifier": row[10],
            "infoIdentifier": row[11],
            "facts": self.get_facts(name),
            "posts": self.get_posts(name)
        }
        return {
            "roleData": role_data
        }

    def get_parameter(self, simple_name: str):
        if not self.has_parameter(simple_name):
            raise NameError(f"There is no parameter with name: {simple_name}.")
        query = f"SELECT description, min_value, max_value FROM Parameter WHERE simple_name = %s;"
        description, min_value, max_value = execute(Query(query, (simple_name,)))[0]
        return {
            "parameter": {
                "simpleName": simple_name,
                "description": description,
                "minValue": min_value,
                "maxValue": max_value
            }
        }

    def get_metric(self, simple_name: str):
        if not self.has_metric(simple_name):
            raise NameError(f"There is no metric with name: {simple_name}.")
        query = f"SELECT description, min_value, max_value FROM Metric WHERE simple_name = %s;"
        description, min_value, max_value = execute(Query(query, (simple_name,)))[0]
        return {
            "metric": {
                "simpleName": simple_name,
                "description": description,
                "minValue": min_value,
                "maxValue": max_value
            }
        }


DATA_MANAGER: DataManager = DataManager()
