import mysql.connector

if __name__ == "__main__":
    conn = mysql.connector.connect(
        host="127.0.0.1",
        port=3306,
        user="admin",
        password="admin",
        database="mydatabase"
    )
    print(f"Connection successful: {conn.is_connected()}")

    cursor = conn.cursor()
    query = "SELECT image_data FROM images WHERE id = %s"
    cursor.execute(query, (1,))
    record = cursor.fetchone()

    with open("image_dup.png", "wb") as file:
        file.write(record[0])
    conn.commit()
    conn.close()
