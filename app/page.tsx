"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const STL_VERTS_B64 = "3NfRv2Slu745Wak+uUHYvx06dL4/D7U+sMLbv1jK370MP7k+zczcv8hHXj2Rqbk+HY3ZvyUUPj6Pwrc+gJXTv2IFoT66z7Y+hY/Ov9V3zT5AbbA+z1nOv3R9pL5GanQ+BRnSv85aZb7CpWk+jY/Vv6t+570XpWk+MhjXv6MxQT2JIG0+uRnUvzLuJj5uB2s+247PvxUukz7v2XM+2NzDv44cAb89fKo+aSbKv1DQ0L6QwMI++3vKv45xhr5Oytc+m2HKvzFqtj6oidc++lPFv69Z7T5RLLs+3le9v1loDD9y+q0+J/++v2MX7r6VZWk+W8bAvzv3sL6gKmc+nenFv+8/dr4/SmY+DDjLvy8I470zOGY+ObTLv5N3oT0mg2Y+eevHv7GvPz5veWY+bSfBvy7NnD6lo2Y+88nBv2+Y3T6AMG0+r3e+v2pBqr4rNGk9eW7Fv6Zjcb5S6WQ9qOLKvxdRvr3WGUo9jIvLvxw2Kj2piVM9YGTHvwwGPT4/5XE9rA3Av695mD7zSGY97vS8vy9Wor5WOKC8SQ3Cv5w4d77yQ6C8zA7Iv++Vyb3bp4i8kC3Iv4toSz3TjY28FZHEv4yHPD5l94681nK+v3+mjz4hla28t+ixv4qEHr9t4ao+fFW2v09RD7+tssc+rJq4v2KdAj8aptc+yIiyvw5hFz+T3Lk+dnKrv0WMGb/b3nc+xkCwv8Wu+r6pNGc+Nxy3v+XY0b7St2Y+XrS5v2Jsvj5BaGY+aEWxv3YA4z4cLWY+qGWwv8+EDD8zRWw+zMetv8O47L7POk095kO1v7fX076oa10988a4v3sivj7i4WQ9iPGwvzNt2z5jjIA9jDWrvzoC5r4RLw29sjSzv0Xbx74MxAO9IcC5v1Z5j76FFhy9qjS2vwN5/r25cTu9FOW2v9hUeD1c+Tu99Rm5v4WBTz5I0ym9CkW2vyEtsj7wc/i8sKytv5xA1T42HQm95Wahv6HZK7+g9bM+dNKmv3qLzT5Zydc+vUqkv/GBIj+5yL8+gsGdv2i3LT9b16s+iHiiv8WXHb/H2Go+Pryhv1RkB7/BamY+H2ikv/QIAT9sRmY+20acv+JbDj/cN2k+C1GdvxrMKz9EjI8+Kligv3P6Bb/OlVs95FSiv8dLAD9aNFM9VDyav1rKBz8Q3Go9hVWgv2aE+L7Pxze93fKjv4r+1b6LYV69AUqiv6zoYr5rBHO9kw+ev3RAar2bXYK9M3qkv/+wiz2iAG69a0ahv8vlQj5XhXe94w6cv/sRxj4tbIK94Amhv98E7j5wjTy9K2KRv1GrM7+Bb7U+3uuRvx6mJT+nDdc+9baRv1a7Mj/OnKk+Dv+Lv+5rHb8MeWo+LCCSv1FgEr+xWmY+hIaQv79uET8dD2c+PxiRv6WeLj/MYIs+4KOHv4iQFb/JpKI99liPv+BkEb/Zo1s9YJ2Pv70aDT/SDjc9qWGOv9JFA7/SmpC9RP+Mv+umyr548Le9+SyQvxDXar6tMKi9cKOPv2kVy70wLKy9PfqSvx4gED10XJ29v66OvwtgVT5NAq69lp6NvzdspD5p1LO9HoePv9LN+j6HuJW9CsKMvxhwCT+dMYe8ENZ8vy9WL7/SNcg+jVx9vzpeJz+6e9c+eRKBv+NjND89T6k+pmJ+v5sQGb/XpGY+RdN7v/m9FD+ytGY+/HF7v5KWFr+P+mI96rSBv5IVFL/+mpM8OJd8vwMbEj9OgTw9LGOAvzwgBL8GWdK9UwyDv2Zm375y/+2949OCvzMcar5L0eu9ewSCv8642b3miu+9iySDv0ckOT10eea9uX2Dv1mjOj7BpOa9wb+Dv1wPlD60Zee9wE2Bv2u4+z4sIeW93yl5vyDRDD/Qib28Duxxv0Rd+b5Ddhm+OmJxv74i0b5nZiO+3fxwvz+jZL4G1iC+yrNwv32r0b1/Mx6+DGZyvz4FIj3MvRm+y2V0v6ATNT4FpBe+sMFzvxPQsj6rXR2+bcRxvwYg7j61txq+X2hSvzmNNL8KPLo+n1FYv5bsJj/8b9c+qVVfv5x4ND/9J60+FX9Zv6K7Gr8laWc+epJXv29EFj8+ZGc+TSpgvxf5Fr9yliQ9c3hbv9M/Ez9uZE09VXlZv7/vDb/pJne9W2FOv838BD/EctC9XItWv4I4Dj94MuO82O1gv+Gz777IcUS+TvlXv4WF0b6Q9HO+hUdZvzGrgb42UnK+RDVcv38eo72Pgl++Cfxavwb2GD0i6WS+4KNZv3O2LT7hWG6+oPpZv640sD5AtnG++Jtdv+JH3j6JgVa+a0pLv/xmt76BjJi+1mZKv5Rdj77oHaG+5HRMv/RjnL0ZZZm+w+xNv7iPnzxqI5O+vzJMv9wjOT5svJu+SCxKv3akqT6z+5u+SPw1v/pNMb/aCsY+s0Q1v2IdJj8fVNc+WOErv8mGND/3erU+P2szv3KyG79hX2g+BNU1v3tuFj+BbWc+loE8v+iCF7/OwFk9KT88vxhlEz+G/Ts9mAo9vy7tDL/RGJi93Mg4v5lSBD/Uw+K9X+c9vwG6Cz8+hlm9pCQ3v4Gr+b7mGTi+/F8qvxXk276u34G+0U4xvz4J5j5uuVW+UJg2vy7Br77ArqW+f9g7vziMbr7CLMG+LgY9vxIUEL6iz86+6jU+v7gUpj130c2+ncg7vy46RT5oscW+07M6v2gOlT57F7C+Fu81vxzfxj7OeI6+UE0jv2ENK75y6tO+UwQ0v3wtpr3BuNe+j2s1v/RZYD0lx9e+UR8tv4WhAj5+BNW+XQ4Mv7rCLr9r8M0+EJgSv7o3Ab8bydc+DPcNv7huJz91ctc+2JgWvymMND9wk7c+enYQv14tG78ycWg+H/YNv8WoFz/C1GY+vpwPv843F79zIj09lWAPvyW2Ez+PtmE9E04Rv3juD7+hPE+9SzISv9fmAz/D8ua9hAIVv41cCz+gO2i98g0Wv82S+b6tUDi+bl8Uv6Im2b6vFoS+IewTv0ZG5z49uFK+7zIIv2R5rr6FMqS+QP4Jv3RJeb7zWb2+nUsKv7wSD7655c2+8wAIv9acoz1dDse+dKoKv1KYOj6118W+OWgGv/cDmj7q86q+7GMdvwKhyD6uq42+5p4Qv0ubpr3Fuda+AX8Qv+YrJT0I0Ne+vw4cv6quCD7RvdS+JibdvjzTML/kmcI+BxbWvhoGJj+ieNc+w7vfvhTFMz8Yva0+uYPVvnrhGr+QdWc+YmbVvhPvFT9gGWc+Ub7VvrdfF7/FLog90ebCvknjFL89Vuw7XYLJvjmpEj9gygU9beLVvi+lEb+A1N+87czevkZ0DT+a5f280HnJvtm17b53xEO+qtncvkBqz75oMm++h23XvutIdr6yg2i+2b7Jvrqour3oXUe+9nvTvmmmPj0gU1i+yojavoMyaz59oWy+c/bdvpVqtj5kIna+IbHUvvg93T4nqVe+haf1vnCivb42IZS+nrfzvhpLh75qx5a+N9T0vg4ZGD2s2JW+mePyvv0rPz6SRZW+bBL2vhGwsT5SNpW+OU2RvkGaML8Kzsk+mX+pvugN6z35y9c+LASfvoyWJz8xbdc+8haQvnVfND+QNbI+BN+PvgXOGL8Uu2Y+eFSUvseTFD9z52Y+vL2VvrqOFr9w3F09XQ6Bvmw4FL96DOE80Q+NvmzVET+EbUU9HIuJviMxAr8IVdC9syGDvpXjzb4Gvu+9n1+Fvkxodb6Iq++9v21zvpik7r0wSNq9L6d0vg6aCzwHatq9KUCFvjgBFz64ie29c0uBvmihsj7v8Oy9tfmGvn7U+j7ME9+97vSIvt5dCz9czeC8aXSovvUy+b7nKBa+cOmpvnXozL6f3R++w12kvnX9gL6zhRa+Y6eqvn9E0L1JKhu+9K6rvmek4DvjkBu+npyovo5kWT7J/Rq+ZHunvpe+qz4g3xy+fRWpvlc17j495Ba+kY4PvteJML+vUMs+zpxQviyt876Wydc+aJsKvu+pJz6Lytc+qiwKvsnpJj8/Ytc+aW4QvlhtND/Xx7c+x+k+virZF79qOGc++8r3vePTEb8dIWY+9XgMvkZYDz+Ms2Y+iOFWvgeSFb+jTMc9/iYYvpEeEb+YL1w9+IEZvqFRDT/prlk9gtsevpp8Ab/hJY29kMsVvqkZz776Dae9pL8TvurEb75/Lae9WysYvnRpBb6aGKi9j5wgvtOQET3sD629rdr5vc88Gz5nOJy9QvQovjY9pD6OAbK9xcsbvmpw+D5TR5G9LA9DvgIkCT+8Mbi83AS4vKb7ML9g/8g+m8KauynwJj88m9c+ULg1vHuMND+U3rY+jBf2O2qEKL/po2g+56uiOofABb+h5GY+sFqXPFGM/z70umc+VJBavWldCj+lAGc+aak2uzQ1A79c9W49akcKPJu//D5nTWo9sfSDvcghCD9qV5c9KnzGvADv776NgS29VjPXPNxv1L6Gfia9tGHROwUaiL5D1Ge9Mgi9vJkKyb2NgHm9je2uvPxxhz1z7Xi9YC65PIMjJD6ygGW9DWeuO2bytD5Y+Vq9kc0GvHkV4j4hMCe9mgkPPiVZM7/UYr0+0VPjPUYE8r46h7I+Sc4jPtt5zr7oAbY+9w46Pr1suz5GgLY+1OHyPQFw3z7V5rQ+80kCPk2YJz/TbNc+HAwJPjmNND+vwrg+4aepPTx/977gl3k+4AAYPsbz074EtE8+eP8pPiXkwz71/j8+YnykPbN97z41UXc+AigRPpXdJD/fOWo+nX6kPdYL7r4lN5E9/5sdPhw7y74O6I8925YzPo07uD4A44k9rdnoPdxq2T64g489V/IJPm35tb4EgtG8Do83PpD6k74JlOO8W9giPqXuAL7gWjC9jMkCPuPmfjte+EC9QQI+PpVkUD4ZRhC9mXcRPgo+qD4dsti8RQ+ePVfozT4KYNK8SwiKPnWKNL9CG7w+L6aJPs0N9b5257U+BahfPnZhq76fELY+jpqKPk7lc77LGbY+VA6fPm1B1r2C3bU+InmhPr4EiD1qqbU+SZ2SPo+1Pj6eRbY+83VsPlbjmT5yUbY+AjqQPrzG7D5VRbY+FmiNPhP2Jj/MYtc+CFiGPhx+ND+LsLI+9RF+PthuKL/ShWg+XuCPPj5v+r59h3E+zQFdPoHMq76dbT4+ixaMPgVgar42Ujg+pCufPjDj172qnks+2rKhPgpmRD0t6lM+5ZySPqalOz4DdDo+ywZvPuxYlj7DDjo+Y/WTPvxW9T5iw28+4/KVPr7OJD/nTWk+uxVcPvDSp76tq689nq6FPtQZfL4agMQ978acPjVMzL0q57Q9d6mfPlz6Gj0TnKE9soKRPkOAMT65o709kWprPvzHkz4kvKs98vxuPjfRZ77mQZW8noiNPqG90b27hYy843eQPvr2Qz3O94i8KrN9PlIpNT5R6Z68jsRWPlTJhj7MiYm8rvvQPinPLb+mds4+eOjRPnMH9b5GyLU+1AOyPkkL0L575rY+/3PcPsDABr6t57Y+16OwPvAwQz2i6LY+hk65Pnq/tD5Oytc+po/QPiim7D55TrY+nZPRPlZcJz8nctc+NdfEPjOAND//P6o+KXDOPscGKb+aD2o+3JPTPpyJ+b6Nr3M+nIrVPk4T8D62tXg+4I25PhiMJD/5mGg+90MJP+GWMr++H8M+bEMMP5Td9L4Z/rU+gkgGP4oFzD3Tydc+W1AbP7jBdT6Wydc+enIMPyqo7D5vDLY+q8QIPwLYJz8lI9c+M28RP18PND8cDbQ+heAEP1lhKL8fKmg+QAQEP48N+r58r3M+1QEIPyl08j4HEXM+EjgLPydSJD88cmk+cGEyPwnYM7/2p8E+6IgwP1Pp9L5s/bU+EZQ6P8WdmT7U6bY+gHctP7WS7D4fcbY+gEkyP88VJD+urtc+O0IxP24YND8+Urg+HdYvP/iCL78BHII+drgvP2SG+r6nm3I+6SQpP+3N8T5533U+AMcrPyyMJD8btWg+W0xVP55hMr+NGb8+DGhTP5kY9b7s17U+CspaP5d5sr4c6bY+ZZpRP8SC7D42YLY+v99RP2FtJz+GcNc+S4lVP8d7ND/9T6s+ipRPPxx9KL8+kmg+9INSPzUi+b7pK3Y+hTNUP1ik9D5/720+I3dHP97rIj/rE2g+5Ut0P0BvLr+i4ss+flp8P1v88L5ztbU+XiN5P6TBu75vx9c++dZ3Pzbq6T5cXrY+bW1uP4haJz8/Ztc+oD9sPxvoMj88Hbk+PEx4P+VEKr/FPnM+nGZ8P8Z+9L5TZnY+iF57P1nb7T5wr3Q+7gBwP3G3Iz/Momg+yNyOP6+CM78DsrY+/VuHP4yH6L4jGLY+JZyQP+Mn2L5EG7Y+AeqUPwlDxT7CrbY+zmyNP9RH1j60ALY+rTSQP3ufJT837NY+JmSPPyBcMj8hqas+aKuNP0dyJ7+5XWs+bsOJP4Nn6r7LQnM+AxmRP17o2b5vXHk+qKaNP4Lk2j7ra3Q+KF6NPx52Iz+AnGk+nwSOP7WbLT/zzIg+3iCfP0mUK7+ABrg+sLCaP0APEb8Fy9c+Y2+cP8Fitr4F7bU+SVGlP9INjr5D5LU+YVeiPyIXub2pWsc+fsKmPw0TdT7g+7U+PcSePz8jpD6sQrY+9uGhP8qrJD8fWrg+0IibP33PLT/Umqo+mayfP/4PHr/fk2o+G+miPwSdBL+XtWc+kHidP9UFuL6FB3Q+4tulP4ZYj75pOng+VjmnP0WleT70b3s+0lKfP2e1qD760HQ+xM+XP+OQzD41PGg+n/efPzcnGj/XIWo+4siYP+FhLT880o8+RAWwP+xNHr9Tr7A+mmG0Px/IC7+AeNM+pzSqP1u5WL74VrY+wHquP2LJ4b0u37U+s4KvPyT5Lj2KRbY+oyGrPxPSNT7+DbY+D1e2P0dnAj9+dtY+j3iwP20ZGT8L/64+Q9SpP88sFr+TQm4+8hyyP60xCb/j8mg+NwOoP2Agpb6ts2c+BlyrP686XL4I5nI+guivP/Lx1L0d7nM+3nuwP585Yz0EgnQ+Fv2rPy3tPz4w23I+mh6pPy4SiT62c2g+vUG0P1KeAj9Ge2g+UbysP1vsDT+pPms+R5XBP+ZWAL/HUbY+5lrHP5gMzb48x88+uhLKP2iSlL4I0Nc+nQfHP73zvT50gdc+EjPEP/U+8T6s2a0+ePK7P1fsCj/0vKY+xrO9P67J775fG28+vNbFP3+1wb7ms2k+tIPHPyzZib4Gt2c+IN66P8swVz0otGc+hf/HP3DgYD5quWc+ejvHP2f3sT6IVWg+8wzAP6PK2T4wSmo+Xw3PP67tvr6n07E+B5rVP9bqeL6yGLg+zZ3ZP5mP6b0lj7g+MsvaP20eTz0QLrI+LgXYP5l1QD4hE7I+BifSPzWXoz5vtqw+d1TMP1XUzT4Tyao++ezMP6uNrL5iuoA+AZrPP2gNdr75iWw+qM7TP3mOA75Pu20+JhjVP4dYfD2xN3A+sTLRP6zDOz4+9mk+F8DMP2nVjD69cGk+zczcPz/GSby1kLw+";

const STL_INDEX_B64 = "AgADAAoAAgAKAAkACgADAAQACgAEAAsACQABAAIABQALAAQAAgAEAAMACwAFAAwACgAXAAkACAABAAkACAAHAAAAFQAIAAkADAAZAAsACwAZABgAAgABAA8ABAACAD4AAAABAAgAEAAGAAUAAAAHABQADAAFAAYADgAAABQAAAAPAAEAFwAKAAsABwAIABQADgAPAAAAFgAJABcAEAARAAYAFQAJABYAFwAeABYADQAAAA4AHQAWAB4AFwALABgAHgAXABgADQAOABQAHgAkAB0AIwAdACQAGQAGABEAHgAYAB8AJAAeAB8AJAAfACUAHQAVABYAHQAjACIAHQAcABUAHAAdACIAFQAUAAgAGQAMAAYAGQARABoAFAATAA0AIAAfABgAPgACAA8AIAAYABkAIAAlAB8AKAAPAA4AFQAcABsAIAAmACUAIgAbABwAPgAQAAUAGgARABIAIgAhABsADQAoAA4ANwAiACMAJQA7ADoAGwAUABUADQAoACcAJQAmADsABAA+AAUAGwA2ADIAGQAaAC8AOQAkACUAIAAzADsAIAA7ACYAIQA2ABsAMgAtABQANgAhADcAIgA3ACEAKAANACwAEgARACoALAANABMALgAZAC8AJAA4ACMAEgAqADAALAATABQAOQAlADoAMgAUABsALAAnACgALwAaABIAKQARABAAEAA+ACkAEQApACoAMwAgABkAMwAZAC4ALQAsABQATgA5ADoALgA0ADMAIwA4ADcANwA4AEsAMgAxACwAPgAPACgALgAvADQALwASADAANAA8ADsANAA7ADMAMgAsAC0AKABkAD4AKwAnACwATgA6ADsANgAxADIAKgApAD8AUABOADsALwBDAEcARgBCACwANgA1ADEAOQBOAE0ASgA2ADcANABQADwAPQAoACcAQgBBACwANAAvAEcAOAAkADkAQwAvADAAQQArACwAKgA/ADAASQA1ADYASQA2AEoASQAxADUAOAA5AEwAUAA0AEcAMAA/AEQAKwBBACcASQBGADEAKQA+AD8AUABPAE4ATABLADgAUAA7ADwAQQA9ACcARgAsADEATQBMADkAQwAwAEQARABAAEUARAA/AEAAZAAoAD0ASABHAEMATQBfAEwARgBZAEIASgA3AEsAPQBBAFQATgBPAGIASwBMAF4ATgBiAGEATgBfAE0ARQBXAEQAXwBOAGAASABDAEQAYgBHAFoASABWAFoATwBQAGIAUABHAGIAQABSAFMARwBIAFoAVQBBAEIASABEAFYASQBKAFwAWQBJAFsAWQBVAEIAVwBWAEQAQABTAFcASQBcAFsATgBhAGAAUQA9AFQAVQBUAEEAYgBaAGMAQAA/AFIAXwBeAEwAWQBGAEkARQBAAFcAUgA/AGUASwBdAEoAXgBfAF0AXQBLAF4AXABKAF0AUQBkAD0AVgBoAGsAXgBwAG8AYQBxAGAAUwBWAFcAXwBgAHAAVABpAGcAVABVAGkAXgBuAF0AVgBrAFoAZABRAFQAVQBZAGkAaQBZAFgAZQA/AH4AYQByAHEAWwBsAFkAfwBTAGYAVwBTAGYAYABxAHAAVwBmAGgAagBZAGwAXABsAFsAXABdAG4AawB0AGMAUwBSAGYAcwByAGIAXABuAG0AawBjAFoAbgBeAG8AVwBoAFYAXgBfAHAAXABtAGwAYgBjAHQAcgBhAGIAaQBZAGoAbQB2AHUAcABvAG4AdABzAGIAZgBSAGUAbQBuAHYAfwBmAGUAeQB4AG8AlwCyAJkAcwB7AHIAcgB7AHoAbQB1AGwAbwB3AG4AdgBuAHcAewBzAHwAfgA/AD4AcQByAHoAegBwAHEAeQBvAHAAfQBkAIAAeAB3AG8ArgA+AGQAdwCKAIkAdACFAHMAawBoAIEAhABpAGoAbAB1AIQAlwB+AJYAeAB5AIoAZABUAGcAawCBAIMAiwB5AHoAiwB6AIwAhABqAGwAgwB0AGsAeQBwAHoAgwCGAHQAaQCCAGcAjgB7AHwAiACHAHYAfwCBAGYAdQB2AIcAhAB1AIcAjAB7AI0AfACFAI4AigB5AIsAZwCAAGQAjgCNAHsAhACCAGkAigB3AHgAewCMAHoArgBkAJUAggCAAGcAdACGAIUAiAB2AHcAdwCJAIgAhgCDAJ4AmgCCAJwAhQCdAI4AgQBoAGYAmQCBAJcAfABzAIUAiACJAI8AfwBlAH4AnACCAIQAlACTAIwAkACPAIkAiwCTAJIAiQCKAJAAfQCAAJgAlACMAI0AfgA+AJYAiwCMAJMAiwCRAIoAlACNAI4AmQCDAIEAkgCRAIsAhACHAJwAkgCTAKYAkACKAJEAfQCVAGQAtACbAJkAkgClAJEAkwCUAKYAkACRAKMAggCaAIAAtwCeAJsAkACiAI8AowCiAJAApgClAJIAnACzAJoAqACnAJQAlACnAKYAnQCFAJ4AoACPAKIAowCRAKQAqgClAKsAjgCdAKEAnwCcAIcApQCkAJEAhgCeAIUAmwCeAIMAmgCYAIAAqgCkAKUAlQB9AJgAqwClAKYAngC3AJ0ApgCsAKsAoACIAI8AnwCHAIgAlwB/AH4AjgChAKgAoQCdAJ4AmACzALEAqACUAI4AnACfALgAtwC2AJ0AoACfAIgAoQCdALYAnAC1ALMAlgA+AN0AoQCnAKgAqgCjAKQAoAC4AJ8AowCqAKkAtQCcALgAsACWAK8AuwCjALwArgDdAD4AuwCiAKMApgC/AKwAvwDEAKwAqQC8AKMAvACpAMIAqgDCAKkAqgCrAMMAuQCgAKIAwgCqAMMAsgC0AJkAmwCDAJkApwDAAL8AoQDBAKcApgCnAL8AlwCWALAAlwCwALIAuwC5AKIAoQC2ALoAugDBAKEArADDAKsAwQC6AMAAwwCsAMQAsQCVAJgAlQCtAK4AuQC4AKAAsQCtAJUAgQB/AJcAuQDQALgArwCWAMYAvQC8AMIAygC1AM0AxAC/AMMAvwC+AMMAtACyAMwAwwC+AL0AwwC9AMIAzgC3ALQA3QDGAJYAmgCzAJgAwQDAAKcAtgC3AM4AzgC0AMwAuQDXANAA2QC9AL4ArQDFAK4AvQDYALwAuwDXALkAvQDZANgArQCxAMUAugDWAMAA2AC7ALwA2ADXALsA2wDAANYAvwDaANkA2ADTANEArwDHALAAyACxALMA2QC+AL8A2wDaAL8AtAC3AJsAygCzALUA1gDVANsA2ADZANMAugC2ANYA7AC2AM4AyQDHAN8AwADbAL8AyQDMALIA0QDQANcA0QDXANgAyQCyALAA1QDUANoA2QDaANMAyADFALEAzwC4ANAA1QDaANsAxgDHAK8AtQDPAOUA0wDSANEA0wDaANQAyACzAMoAyQCwAMcA7AD1ANYAygDLAOIAzwC1ALgAzADJAOQA0wDVAPMAzQDLAMoA1QDTANQA0gDTAPIA7wDQANEA3wDHAN4A4gDLAOMAywDNAOMA1gC2AOwAxwDGAN4AzwDvAO4A0ADvAM8AyADcAMUA0QDSAPEA5QDPAO4A1gD1ANUAyADKAOAA9ADzANUA4wDNAOUA8ADRAPEA9ADVAPUA3ACuAMUAzADtAM4AyADgANwA4gDgAMoA7wDRAPAA8QDSAPIA7ADOAO0A8wDyANMA9ADqAPMA5ADtAMwA8gDzAOoA8ADxAOcA8gDpAOcArgD3AN0A5QDNALUA5wDxAPIA5QDuAOYA5wDmAPAA5gDuAO8A8ADmAO8A7ADrAPUA6wD0APUA+ADGAN0A4gD+AOAA4QDkAMkA3gDGAPkA6wDqAPQA6ADnAOkA6AAEAQMB6gDpAPIA5QABAeMACQHtAOQA5QDmAAEB4gDjAP8ArgDcAPcA6wAIAQcBBQHpAOoABQHqAAcB+QDfAN4A6wDsAAgB7QAJAewACQEIAewAAgHnAAMB5gACAQEB4AD+APsA6AADAecA/wDjAAEB4gD/AP4AAgHmAOcAAAEJAeQA3AD7APYA+gDhAN8ABAHpAAUB5ADhAP0A+gDfAPkAyQDfAOEA9gD3ANwABQEHAQYB6QAEAegA/QAAAeQA/AD7AP8AAAEIAQkB3QD3AB0B6wAHAeoA3ADgAPsA+gAMAf0A/wD7AP4A/QDhAPoABAECAQMB+wAOAQ0BCAEHAQYB3QA5AfgAEgEbAQgBxgD4APkA+QALAfoACAEaAQcBAQECARUBAQEVARQBHQE5Ad0AAgEDARUBAAH9ABAB/wABAREBGgEIARsBEgEAARMBDgH8AP8AAAEQARMBBAEXARYBBAEWAQMBCgH3APYAEgEIAQABGgEGAQcB/AAOAfsAEQEOAf8AEQEBARQBFgEVAQMBGQEGARoBGQEFAQYBBQEYARcBCwEMAfoAEwEQAQ8B9gANAQoBPgEcAQoBJwH9AAwB+AA5AR8BDwESARMBEAH9ACcBFwEEAQUBGQEYAQUBMAEvARkBHwH5APgA9wAKAR0BIwENAQ4BLQEuAU8BDwEQAScBCwH5ADwBGwExARoBFQEsARQBEgEPASYBKwEyARsBEgEmASsBGwEyATEBKAEUASwBIwEOAREBKAERARQBKQEoASwBKAEjAREBGgExARkBKwEbARIBHAEdAQoBLAEVARYBMwFcAWABDQEjAT4BLQEsARYBKAEkASMBIgEnAQwBLgEvAU8B9gD7AA0BLQEWAS4BMgErATEBJgEgASsBHQEjAR4BPQEnASIBKwEqATEBHQEcATMBIQEMAQsBDwEnAUYBJAEeASMBKQEkASgBDwFGASYBFwEvAS4BFwEYAS8BIQEiAQwBLwEYARkBHwE8AfkAHgEkAUABJQEqASsBMQFRATABMAFQAS8BIAE6AR8BIQELATwBMQEwARkBLgEWARcBHgE0AR0BKQFIAUABJQEgAR8BJQErASABHwFFASUBIAEmATsBPQFHAScBTgEsAS0BRwFGAScBTQEqAUUBKgFSATEBQAE1AR4BPwE+ASMBLAFOASkBHwE6AUUBTQFSASoBMAFRAVABKgElAUUBTgFIASkBKQFAASQBPQEhATwBUQExAVIBTgFJAUgBNAEeATUBUAFPAS8BQQE2ATUBIAE7AToBQQE1AUABQQFAAUkBHQFiATkBWAEfATkBTQFRAVIBQAFIAUkBUQFNAUwBTgFPAUoBTwFOAS0BOQFEAUUBHwFYATwBPQEiASEBUwEdATMBTAFNAUUBPwEdATQBRAFMAUUBOwFGAV4BRgE7ASYBTgFKAUkBOgE5AUUBNQFVATQBTwFJAUoBPwFdAT4BUAFMAUsBPgEKAQ0BUQFMAVABSQFKAUEBRwE9AVsBPQFaAVsBHAE+ATMBNgFBAUIBPQE8AVoBNwE2AUIBQgFBAUoBOAFDATkBOQFDAUQBUAFLAUoBPwEjAR0BTAFDAUsBXgFGAUcBTwFQAUoBSwFDATgBQwFMAUQBRwFbAWoBQwFCAUoBNwFCAUMBOAFXATcBNwFDATgBagFfAUcBVwFWATcBQwFKAUsBVQE1AVYBRwFfAV4BVgE2ATcBXAE+AWgBNQE2AVYBPgFcATMBMwFTAWABOQE6AWQBOwFeAVkBOAE5AVcBVAE0AVUBVAFdATQBOQFkAVcBOgE7AVkBWAFaATwBaAE+AV0BgQEdAVMBUwFgAYEBWwFaAWYBWQFkAToBXQE/ATQBWQFpAWQBbwFaAVgBHQGBAWIBVAFoAV0BbQFXAWQBXwFpAV4BVAFVAVYBZwFgAVwBWgFlAWYBWQFeAWkBWwFmAWoBcwFfAWoBWAE5AWIBVwFtAVYBZQFaAW8BegGIAXQBbwF5AXABaAFUAWEBYQFUAVYBWAFiAWMBdwFWAW0BaQFfAXMBVgF3AWwBcwFeAWkBbAFhAVYBbgFtAWQBcAFqAWYBcQFoAXIBXAFoAWcBcQFnAWgBcwFuAWQBZwFxAWABaAFhAXIBYAFxAWsBbwFmAWUBgQFgAWsBfgFqAXQBbAFyAWEBcwFkAWkBegF0AWoBbwFwAWYBgQFrAXUBYgGBAWMBeAFtAW4BegFqAXABcQFyAXsBcwFqAX4BiAF+AXQBcwF4AW4BcQGFAWsBhwFzAX0BcgFsAXwBewGFAXEBcAF6AYQBfAFsAXYBdgFsAXcBfQFzAX4BeQFvAYMBdQFrAYUBfAGFAXIBgwFvAVgBfwGBAXUBeAFzAYcBlAF6AY8BeAGHAYIBeQF6AXABewFyAYUBgwFYAWMBdgGGAXwBfQF+AYcBbQGNAXcBdgF3AYABjQFtAXgBgwGEAXkBdQGFAX8BiAGHAX4BjQGbAXcBhQF8AYYBhgF2AYABkAGFAYYBfwGXAYEBjgGEAYMBggGNAXgBjgGPAYQBhwGNAYIBhAGPAXoBdwGbAZkBmQGLAXcBhAF6AXkBkQGgAZABmgFjAYEBlwF/AYkBhwGIAZMBjgGDAZ0BhgGRAZABkwGNAYcBigGAAYsBlAGIAXoBiwGAAXcBhQGJAX8BkQGGAYABjAGcAY0BkQGAAYoBlQGUAY8BnQGDAWMBiQGFAZABkQGKAZIBkwGIAZQBiwGSAYoBoAGRAZIBkwGkAY0BngGPAY4BlQGPAZ4BoQGgAZIBnwGJAZABjQGkAZwBnwGWAYkBnAGbAY0BiQGWAZcBpgGUAZUBpgGVAacBpgGTAZQBoQGSAZgBkgGLAZgBpAGTAaUBmAGLAZkBngGOAZ0BkwGmAaUBmQGbAZoBpwGeAaYBpwGVAZ4BnwGQAaABnQFjAa4BmgGqAZkBlwGWAakBoQGxAaABnQGmAZ4BlwGpAYEBmQGhAZgBmQGiAaEBsgGxAaEBpQGmAbkBrAGaAZsBtgGbAaQBnQGuAa8BmwGcAaQBuQG4AaUBswGyAaEBuQGmAZ0BtwGlAbgBqgGiAZkBsAGfAaABowGkAbYBoQGiAbMBtwGkAaUBrQGbAbYBqAGxAbABogGqAbMBnwGoAZYBuQGdAa8BtgGkAbcBsQGwAaABmgGBAaoBqQGWAagBqwGqAZoBswGqAasBqgGBAakBsgHBAbEBswGrAbQBmgGuAWMBrQGsAZsBswHBAbIBmgGqAckBrQG2AbUBtQGsAa0BqwGaAawBqAGfAbABqwG1AbQBtQGrAawBtQG2AcMBugG7AakBtQHDAbQBxAG2AbcBqQHJAaoBxAG3AcUBrgG/Aa8BqQG6AagBvwG4AbkBtAHCAbMBugHAAbEBwgHBAbMByQGpAbsBqQGoAbEBvwHGAbgBugGpAbEBuQGvAb8BtgHRAcMBvgHGAb8BrgHLAb0BvgG/Aa4BwAGxAcEBuAHGAbcBvQG+Aa4BrgGaAcsBxgHFAbcBtAHDAdEBmgHJAcsB0AG0AdEBzAG9AcsBtAHQAcIByQHKAcsBtgHEAdEBuwG8AckBxgG+Ac0BugHAAcEBxgHNAcUBzQG9AcwBvQHNAb4BugHHAbsBwgHPAcEBuwHBAccBvAG7AccBwQHOAccBwQG7AboBxAHSAdEByAHJAbwBwQHPAc4BvAHHAcgB0wHEAcUBzAHTAcUB0wHSAcQBzQHMAcUBzwHCAdABxwHOAc8BzwHIAccBzAHSAdMBzAHLAdIBzwHJAcgB0AHKAckBygHQAdEB0AHJAc8B0gHLAcoBygHRAdIByQHKAdQB";

function decodeGeometry() {
  const decode = (value: string) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
  const vb = decode(STL_VERTS_B64);
  const ib = decode(STL_INDEX_B64);
  const positions = new Float32Array(vb.buffer);
  const indices = new Uint16Array(ib.buffer);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

type PointerState = { x: number; y: number; hovering: boolean; pressed: boolean };

function PhysicalSwitch({
  active,
  pointer,
}: {
  active: boolean;
  pointer: PointerState;
}) {
  const root = useRef<THREE.Group>(null);
  const thumb = useRef<THREE.Group>(null);
  const orange = useRef<THREE.Group>(null);
  const geometry = useMemo(() => decodeGeometry(), []);

  useFrame((_, delta) => {
    if (!root.current || !thumb.current || !orange.current) return;
    const ease = 1 - Math.exp(-delta * 11);

    root.current.rotation.x = THREE.MathUtils.lerp(
      root.current.rotation.x,
      -0.12 + (pointer.hovering ? pointer.y * 0.075 : 0),
      ease
    );
    root.current.rotation.y = THREE.MathUtils.lerp(
      root.current.rotation.y,
      -0.15 + (pointer.hovering ? pointer.x * 0.11 : 0),
      ease
    );
    root.current.position.z = THREE.MathUtils.lerp(
      root.current.position.z,
      pointer.pressed ? -0.09 : pointer.hovering ? 0.10 : 0,
      ease
    );

    thumb.current.position.x = THREE.MathUtils.lerp(
      thumb.current.position.x,
      active ? 0.72 : -0.72,
      ease
    );
    thumb.current.position.z = THREE.MathUtils.lerp(
      thumb.current.position.z,
      pointer.pressed ? 0.37 : 0.46,
      ease
    );
    thumb.current.rotation.y = THREE.MathUtils.lerp(
      thumb.current.rotation.y,
      active ? 0.08 : -0.05,
      ease
    );

    orange.current.position.x = THREE.MathUtils.lerp(
      orange.current.position.x,
      active ? -0.66 : 0.66,
      ease
    );
  });

  return (
    <group ref={root}>
      <mesh geometry={geometry} castShadow receiveShadow position={[0, 0, -0.16]}>
        <meshStandardMaterial
          color={active ? "#090909" : "#e5e0d3"}
          roughness={0.72}
          metalness={0.03}
        />
      </mesh>

      <group ref={orange} position={[0.66, 0, 0.24]}>
        <RoundedBox args={[1.42, 0.73, 0.18]} radius={0.30} smoothness={7} castShadow>
          <meshStandardMaterial
            color="#ef7928"
            emissive="#c64b09"
            emissiveIntensity={active ? 0.78 : 1.02}
            roughness={0.58}
            metalness={0}
          />
        </RoundedBox>
        <pointLight position={[0, 0, 0.55]} intensity={active ? 0.35 : 0.55} distance={2.5} color="#ff8a34" />
      </group>

      <group ref={thumb} position={[-0.72, 0, 0.46]}>
        <RoundedBox args={[1.58, 0.92, 0.37]} radius={0.30} smoothness={7} castShadow receiveShadow>
          <meshStandardMaterial
            color={active ? "#101010" : "#c9c4b7"}
            roughness={0.72}
            metalness={0.02}
          />
        </RoundedBox>

        <RoundedBox args={[0.71, 0.80, 0.22]} radius={0.28} smoothness={8} position={[-0.38, 0, 0.26]} castShadow>
          <meshStandardMaterial
            color={active ? "#1c1c1c" : "#f1ede4"}
            roughness={0.62}
            metalness={0.01}
          />
        </RoundedBox>

        <RoundedBox args={[0.73, 0.81, 0.24]} radius={0.31} smoothness={8} position={[0.39, 0, 0.27]} castShadow>
          <meshStandardMaterial
            color={active ? "#050505" : "#8b8575"}
            roughness={0.76}
            metalness={0.01}
          />
        </RoundedBox>
      </group>

      <mesh position={[0, -0.9, -0.34]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.15, 0.95]} />
        <shadowMaterial transparent opacity={active ? 0.42 : 0.22} />
      </mesh>
    </group>
  );
}

function SwitchCanvas({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  const [pointer, setPointer] = useState<PointerState>({
    x: 0,
    y: 0,
    hovering: false,
    pressed: false,
  });

  return (
    <button
      type="button"
      className="switch-hit"
      aria-label={active ? "Switch to light" : "Switch to dark"}
      aria-pressed={active}
      onClick={onToggle}
      onPointerEnter={() => setPointer((p) => ({ ...p, hovering: true }))}
      onPointerLeave={() => setPointer({ x: 0, y: 0, hovering: false, pressed: false })}
      onPointerDown={() => setPointer((p) => ({ ...p, pressed: true }))}
      onPointerUp={() => setPointer((p) => ({ ...p, pressed: false }))}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPointer((p) => ({
          ...p,
          x: THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
          y: THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1),
        }));
      }}
    >
      <Canvas
        className="switch-canvas"
        dpr={[1, 2]}
        camera={{ position: [0, 0.1, 6.15], fov: 28 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <ambientLight intensity={active ? 0.26 : 0.78} />
        <directionalLight
          castShadow
          position={[-4.6, 5.6, 6.8]}
          intensity={active ? 3.0 : 4.35}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[5, -2.4, 3]} intensity={active ? 0.38 : 0.65} />
        <PhysicalSwitch active={active} pointer={pointer} />
        <ContactShadows
          position={[0, -0.93, -0.5]}
          opacity={active ? 0.58 : 0.34}
          scale={4.6}
          blur={1.3}
          far={2.8}
        />
      </Canvas>
    </button>
  );
}

export default function Home() {
  const [dark, setDark] = useState(false);

  return (
    <main className={`scene ${dark ? "scene--dark" : "scene--light"}`}>
      <motion.div
        className="scene-light"
        animate={{ opacity: dark ? 0 : 1 }}
        transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
      <motion.div
        className="scene-dark"
        animate={{ opacity: dark ? 1 : 0 }}
        transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
      <div className="scene-grain" aria-hidden="true" />

      <div className="switch-wrap">
        <SwitchCanvas active={dark} onToggle={() => setDark((value) => !value)} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={dark ? "dark-flash" : "light-flash"}
          className={`scene-flash ${dark ? "scene-flash--dark" : "scene-flash--light"}`}
          initial={{ opacity: 0.14 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />
      </AnimatePresence>
    </main>
  );
}
