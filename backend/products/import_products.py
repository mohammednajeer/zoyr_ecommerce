import json
from products.models import Product
import os 
from django.conf import settings
def run():

    file_path = os.path.join(settings.BASE_DIR, "products", "products_data.json")
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

        products = data["Products"]
        cloudinary_map = {

                            "DSC04289-1-scaled.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947558/DSC04289-1-scaled_blcqxo.jpg",
                            "DSC05990-scaled.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947574/DSC05990-scaled_blfn6k.jpg",
                            "DSC02129-scaled.jpg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947570/DSC02129-scaled_w2z6ve.jpg",
                            "bmwblue.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947535/bmwblue_bka5l6.jpg",
                            "bmw5series.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947503/bmw5series_sapsh8.jpg",
                            "bmwblacksuv.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947536/bmwblacksuv_gjsl95.jpg",
                            "yellowminicooper.jpg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947582/yellowminicooper_ysqjmr.jpg",
                            "DSC02149-scaled.jpg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947545/DSC02149-scaled_y55lvz.jpg",
                            "BLACKMERCEDES.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947498/BLACKMERCEDES_vjwrnf.jpg",
                            "maybachblack.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947573/maybachblack_wy61iq.jpg",
                            "bmw7series.jpg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947509/bmw7series_hv3xsm.jpg",
                            "rollseroys.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947578/rollseroys_i5ih2o.jpg",
                            "lamborgini.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947574/lamborgini_kyl8bf.jpg",
                            "DSC01044-scaled.jpg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947559/DSC01044-scaled_a5hsx2.jpg",
                            "DSC09803-scaled.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947578/DSC09803-scaled_seqyz0.jpg",
                            "DSC00525-scaled.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947564/DSC00525-scaled_ybdmz1.jpg",
                            "DSC03563-scaled.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947554/DSC03563-scaled_gxneer.jpg",
                            "DSC09285-scaled.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947569/DSC09285-scaled_kzlhuu.jpg",
                            "DSC07807-scaled.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947564/DSC07807-scaled_kj8owr.jpg",
                            "DSC02969-scaled.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947554/DSC02969-scaled_zrern5.jpg",
                            "DSC03102-1-scaled.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947555/DSC03102-1-scaled_spowzu.jpg",
                            "WhatsApp-Image-2023-07-10-at-12.23.01-PM.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947583/WhatsApp-Image-2023-06-12-at-6.23.09-PM_kizuki.jpg",
                            "rngerovver.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947577/rngerovver_iqfzza.jpg",
                            "DSC04763-scaled.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947561/DSC04763-scaled_pp5web.jpg",
                            "IMG_5887-scaled.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947574/IMG_5887-scaled_xyrqkh.jpg",
                            "orangebentley.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947582/orangebentley_uudu22.jpg",
                            "porschecayenne.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947577/porschecayenne_wpohbv.jpg",
                            "minicooperEV.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947574/minicooperEV_gqzble.jpg",
                            "VOLVOC90.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947582/VOLVOC90_sjpzvy.jpg",
                            "AMG.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947541/AMG_hpcnyq.jpg",
                            "AUDIA6.jpeg": "https://res.cloudinary.com/dsr0cqaig/image/upload/v1771947491/AUDIA6_f0jmrr.jpg",
                            "dfdgf": "",
                            "bmw540i": "",
                            "bmw511.jpg": "",
                            "audiq71": "",

                            }
        
        for item in products:

            try:

                image_name = item.get("imgSource").split("/")[-1]

                cloudinary_url = cloudinary_map.get(image_name)
                Product.objects.create(
                brand=item.get("brand"),
                model=item.get("model"),
                price=int(str(item.get("price")).replace("$","").replace(",","")),
                year=int(item.get("year")),
                fuel=item.get("fuel"),
                kmCover=int(str(item.get("kmCover")).replace(",","")),
                status=item.get("status"),
                image=cloudinary_url,
                availability="available"
            )
            except Exception as e:
                print("ERROR IMPORTING:",item)
                print(e)
            
    print("Products imported successfully!")