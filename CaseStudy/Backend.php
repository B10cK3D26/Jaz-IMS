<?php
    header("Content-Type:application/json");

    $file = __DIR__ . "/items.json";
    $file1 = __DIR__. "/sales.json";

    if ($_SERVER["REQUEST_METHOD"] === "GET"){
        if(($_GET["type"]??"")=== "sale"){
            $data = json_decode(file_get_contents($file1),true);
            $listkey="sales";
        } else {
            $data = json_decode(file_get_contents($file),true);
            $listkey="items";
        }

        if(!is_array($data) || !isset($data[$listkey]) || !is_array($data[$listkey])) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "error"=> "Invalid JSON structure"
            ]);
            exit;
        }
        echo json_encode($data);
        exit;
    }

    if ($_SERVER["REQUEST_METHOD"]==="DELETE"){
        $input = json_decode(file_get_contents("php://input"),true);

        if(!is_array($input)||!isset($input["id"]) || !is_numeric($input["id"])){
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Missing or invalid item ID"]);
            exit;
        }

        $id = (int) $input["id"];
        $data = json_decode(file_get_contents($file),true);

        if(!is_array($data) || !isset($data["items"]) || !is_array($data["items"])){
            http_response_code(500);
            echo json_encode(["success" => false, "error"=> "Invalid JSON Structure"]);
            exit;
        }

        $itemToDel = null;
        foreach($data["items"]as $index => $entry){
            if((int)$entry["id"] === $id){
                $itemToDel = $index;
                break;
            }
        }
        if($itemToDel===null){
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Item not found"]);
            exit;
        }

        array_splice($data["items"], $itemToDel, 1);

        if(file_put_contents(
            $file,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
            LOCK_EX
        ) === false){
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Failed to write on JSON file"]);
            exit;
        }

        echo json_encode(["success" => true]);
        exit;
    }

    if($_SERVER["REQUEST_METHOD"]==="PATCH" && ($_GET["type"]?? "") === "sale") {
        $input = json_decode(file_get_contents("php://input"), true);
        
        $requiredFields = [
            "originalTransactionId",
            "item",
            "customer",
            "service",
            "transactionId",
            "quantity",
            "income"
        ];

        if (!is_array($input)) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "error" => "Invalid request body"
            ]);
            exit;
        }

        foreach ($requiredFields as $field) {
            if (!isset($input[$field])) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "error" => "Missing field: " . $field
                ]);
                exit;
            }
        }

        if (
            !is_numeric($input["originalTransactionId"]) ||
            !is_numeric($input["transactionId"]) ||
            !is_numeric($input["quantity"]) ||
            !is_numeric($input["income"])
        ) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "error" => "Transaction ID, quantity, and income must be numbers"
            ]);
            exit;
        }

        $data = json_decode(file_get_contents($file1), true);

        if(!is_array($data) || !isset($data["sales"]) || !is_array($data["sales"])){
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "error" => "Invalid sales JSON structure"
            ]);
            exit;
        }

        $sToEdit = null;

        foreach($data["sales"] as $index => $sale){
            if((int)$sale["transactionId"]===(int)$input["originalTransactionId"]){
                $sToEdit = $index;
                break;
            }
        }

        if($sToEdit === null){
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "error" => "Transaction ID not found"
            ]);
            exit;
        }

        foreach ($data["sales"] as $index => $sale){
            if(
                $index !== $sToEdit &&
                (int)$sale["transactionId"] === (int)$input["transactionId"]
            ) {
                http_response_code(409);
                echo json_encode([
                    "success" => false,
                    "error" => "Transaction ID is already in use"
                ]);
                exit;
            }
        }

        $data["sales"][$sToEdit]["item"] = trim((string)$input["item"]);
        $data["sales"][$sToEdit]["customer"] = trim((string)$input["customer"]);
        $data["sales"][$sToEdit]["service"] = trim((string)$input["service"]);
        $data["sales"][$sToEdit]["transactionId"] = (int)$input["transactionId"];
        $data["sales"][$sToEdit]["quantity"] = (int)$input["quantity"];
        $data["sales"][$sToEdit]["income"] = (int)$input["income"];

        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        if($json === false || file_put_contents($file1, $json, LOCK_EX
        ) === false){
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "error" => "Failed to save sales data"
            ]);
            exit;
        }
        
        echo json_encode([
            "success" => true
        ]);
        exit;
    }

    if($_SERVER["REQUEST_METHOD"]==="PATCH"){
        $input = json_decode(file_get_contents("php://input"),true);

        if(!is_array($input) ||
            !isset($input["originalId"],$input["name"],$input["quantity"],$input["id"],$input["price"])
        ) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "error" => "Missing Item Information"
            ]);
            exit;
        }

        $data = json_decode(file_get_contents($file),true);

        if(!is_array($data) || !isset($data["items"]) || !is_array($data["items"])){
            http_response_code(500);
            echo json_encode([
            "success" => false,
            "error" => "Invalid JSON Structure"]);
            exit;
        }

        $itemToEdit = null;

        foreach($data["items"]as $index => $entry){
            if((int)$entry["id"] === (int)$input["originalId"]){
                $itemToEdit = $index;
                break;
            }
        }

        if($itemToEdit===null){
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Item not found"]);
            exit;
        }

        foreach ($data["items"] as $index => $entry) {
            if (
                $index !== $itemToEdit &&
                (int)$entry["id"] === (int)$input["id"]
            ){
            http_response_code(409);
            echo json_encode(["success" => false, "error" => "That ID is already in use"]);
            exit;
            }
        }

        $data["items"][$itemToEdit]["name"]=trim((string)$input["name"]);
        $data["items"][$itemToEdit]["quantity"]=(int)$input["quantity"];
        $data["items"][$itemToEdit]["id"]=(int)$input["id"];
        $data["items"][$itemToEdit]["price"]=(int)$input["price"];

        if(file_put_contents(
            $file,
            json_encode($data,JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
            LOCK_EX
        )===false){
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "error" => "Failed to write on JSON"
            ]);
            exit;
        }
        echo json_encode(["success" => true,]);
        exit;

    }

    $input = json_decode(file_get_contents("php://input"),true);

    if($_SERVER["REQUEST_METHOD"] === "POST" && ($_GET["type"] ?? "") === "sale"){
        $input = json_decode(file_get_contents("php://input"),true);
        
        $req = ["transactionDate","item","customer","service","transactionId","quantity","income"];

        if(!is_array($input)){
            http_response_code(400);
            echo json_encode([
                "success"=>false,
                "error"=>"Invalid request body"]);
                exit;
        }

        foreach($req as $field){
            if(!isset($input[$field])){
                http_response_code(400);
                echo json_encode([
                    "success"=>false,
                    "error"=>"Missing field: ". $field]);
                    exit;
            }
        }

        $numericFields = ["transactionId", "quantity", "income"];

        foreach ($numericFields as $field) {
            if (!is_numeric($input[$field])) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "error" => "$field must be a number"
                ]);
                exit;
            }
        }

        $data = json_decode(file_get_contents($file1),true);

        if(!is_array($data) || !isset($data["sales"]) || !is_array($data["sales"])){
            http_response_code(500);
            echo json_encode([
                "success"=>false,
                "error"=>"Invalid sales JSON structure"
                ]);
                exit;
        }

        foreach ($data["sales"] as $sale) {
            if ((int)$sale["transactionId"] === (int)$input["transactionId"]) {
                http_response_code(409);
                echo json_encode([
                    "success" => false,
                    "error" => "Transaction ID is already in use"
                ]);
                exit;
            }
        }

        $data["sales"][]=[
            "transactionDate" => trim((string)$input["transactionDate"]),
            "item" => trim((string)$input["item"]),
            "customer" => trim((string)$input["customer"]),
            "service" => trim((string)$input["service"]),
            "transactionId" => (int)$input["transactionId"],
            "quantity"  => (int)$input["quantity"],
            "income"  => (int)$input["income"],
        ];

        if(file_put_contents(
            $file1,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
            LOCK_EX
        ) === false) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "error" => "Failed to write in JSON"
            ]);
            exit;
        }
        
        echo json_encode(["success" => true]);
        exit;
    }

    //Verify Receive
    if(
        !is_array($input) ||
        !isset($input["name"],$input["quantity"],$input["id"],$input["date"],$input["time"],$input["price"])
    ) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "Missing Item Information"
        ]);
        exit;
    }

    //Verify Data 
    $data = json_decode(file_get_contents($file),true);
    if(!is_array($data) || !isset($data["items"]) || !is_array($data["items"])){
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => "Invalid JSON Structure"
        ]);
        exit;
    }

    //Creator
    $newItem = [
        "name" => trim((string)$input["name"]),
        "quantity" => (int)$input["quantity"],
        "id" => (int)$input["id"],
        "date" => trim((string)$input["date"]),
        "time" => trim((string)$input["time"]),
        "price" => (int)$input["price"]
    ];

    foreach ($data["items"] as $entry) {
        if ((int)$entry["id"] === (int)$input["id"]) {
            http_response_code(409);
            echo json_encode(["success" => false, "error" => "That ID is already in use"]);
            exit;
        }
    }

    $data["items"][] = $newItem;

    if(file_put_contents($file,json_encode($data,JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),LOCK_EX)===false){
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => "Failed to write JSON file"
        ]);
        exit;
    }
    echo json_encode(["success"=>true]);
?>
